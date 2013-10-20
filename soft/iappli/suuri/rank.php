<?php

//ランキング表示プログラム
$mode = @$_REQUEST["mode"];

//テンプレートの読み込み
$template = file_get_contents("rank_template.html");

//ランキングファイルへのパスの取得
$rankfile_reg = '/<rankfile>(.*)<\/rankfile>/';
preg_match($rankfile_reg, $template , $matches);
$rankpath = $matches[1];
$template = preg_replace($rankfile_reg, "", $template);

$quiz_name = array(
	array("倍数1","ml1"),
	array("倍数2","ml2"),
	array("最大公約数","gcd"),
	array("比の練習","rat"),
	array("割り算", "dv1"),
);

if($mode == 'rank') {
	//ランキングへの登録処理
	$src = $_REQUEST["src"];	//登録元
	$name = $_REQUEST["name"];	//登録名
	$id = $_REQUEST["id"].'/'.$name;		//ID
	$quiz = $_REQUEST["quiz"];	//種類
	$time = $_REQUEST["time"];	//時間
	
	$fp = fopen($rankpath, "rb+");

	if (flock($fp, LOCK_EX)) { // 排他ロックを行います
		//ランキングデータ読み込み
		$rankdata = @unserialize(fread($fp, filesize($rankpath)));
		if($rankdata===FALSE) {
			$rankdata = array();
			foreach($quiz_name as $q) {
				$rankdata[$q[1]] = array();
			}
		}
		
		$valid_quiz_name = FALSE;
		foreach($quiz_name as $q) {
			if($quiz==$q[1]) {
				$valid_quiz_name = TRUE;
			}
		}
		if(!$valid_quiz_name) {
			echo "登録に失敗しました(データエラー)";
			exit();
		}
		
		//ランキングに登録されているかを確認
		$now_rank = 0;
		$last_rank = count($rankdata[$quiz]);
		for($i=0;$i<count($rankdata[$quiz]);$i++) {
			if($rankdata[$quiz][$i]["time"]<$time) $now_rank = $i+1;
			if($rankdata[$quiz][$i]["id"]==$id) {
				$last_rank = $i;
				break;
			}
		}
		
		if($last_rank<count($rankdata[$quiz]) && $time>=$rankdata[$quiz][$last_rank]["time"]) {
			echo "前回の方がよかったようです。";
		} else {
			//記録の更新
			for($i=$last_rank;$i>$now_rank;$i--) {
				$rankdata[$quiz][$i] = $rankdata[$quiz][$i-1];
			}
			$rankdata[$quiz][$now_rank] = array(
				"name" => $name,
				"time" => $time,
				"id" => $id,
				"src" => $src
			);
			
			//書き込み
			rewind($fp);
    		ftruncate($fp, 0); // ファイルを切り詰めます
    		fwrite($fp, serialize($rankdata));
    		
    		$now_rank++;
    		echo "$now_rank 位にランクインしました！";
		}
		
    	flock($fp, LOCK_UN); // ロックを解放します
	} else {
    	echo "登録に失敗しました(ファイルオープンエラー)";
	}

	fclose($fp);
} else {
	$contents = "";
	$rankmenu = "";
	
	$quiz = @$_REQUEST["quiz"];	//種類
	
	$valid_quiz_name = FALSE;
	$rankmenu .= '<ul>';
	foreach($quiz_name as $q) {
		$rankmenu .= "<li><a href=\"?quiz=$q[1]\">$q[0]</a></li>\n";
		if($quiz==$q[1]) {
			$valid_quiz_name = TRUE;
		}
	}
	$rankmenu .= '</ul>';
	
	if($valid_quiz_name) {
		//ランキングデータ読み込み
		$rankdata = @unserialize(file_get_contents($rankpath));
		$no = 1;
		if($rankdata!==FALSE && array_key_exists($quiz, $rankdata)) {
			$contents .= "<table>" .
				"<tr><th>No.</th><th>Name</th><th>Score</th></tr>";
			foreach($rankdata[$quiz] as $user) {
				$contents .= "<tr>" .
					"<td>".$no."</td>" .
					"<td>".$user["name"]."</td>" .
					"<td>".(210-$user["time"])."</td>" .
					"</tr>";
				$no++;
			}
			$contents .= "</table>";
		} else {
			$contents .= "誰もいません";
		}
	} else {
		$contents .= "メニューからカテゴリを選択してください。";
	}
	
	$template = preg_replace("/<ranking\s*\/>/", $contents, $template);
	$template = preg_replace("/<rankmenu\s*\/>/", $rankmenu, $template);
	print $template;
}

