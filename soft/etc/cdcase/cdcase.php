<?php
require('../../../utils/fpdf16/mbfpdf.php');

class MYPDF extends MBFPDF
{
	var $pattern=array(2,2);
	
	function SetLinePattern($p) {
		$this->pattern = $p;
	}
	
	function Line($x0,$y0,$x1,$y1) {
		$pattern = $this->pattern;
		if(!$pattern) {
			MBFPDF::Line($x0,$y0,$x1,$y1);
			return 0;
		}
		
		$dx = $x1-$x0;
		$dy = $y1-$y0;
		$len = sqrt($dx*$dx+$dy*$dy);
		$dx /= $len;
		$dy /= $len;
		
		$lastx = $x0;
		$lasty = $y0;
		for($t=0,$i=0;$t<$len;$t+=$pattern[$i],$i=($i+1)%count($pattern)) {
			if($t+$pattern[$i]<$len) {
				$x = $lastx + $dx*$pattern[$i];
				$y = $lasty + $dy*$pattern[$i];
			} else {
				$x = $x1;
				$y = $y1;
			}
			if($i%2==0) MBFPDF::Line($lastx,$lasty,$x,$y);
			$lastx = $x;
			$lasty = $y;
		}
	}
	
	function concatMatrix($m11,$m12,$m21,$m22,$m31,$m32) {
		$m31 *= $this->k;
		$m32 *= $this->k;
		$s=sprintf('%.2F %.2F %.2F %.2F %.2F %.2F cm', $m11,$m12,$m21,$m22,$m31,$m32);
		$this->_out($s);
	}
	
	function gsave() {
		$this->_out('q');
	}

	function grestore() {
		$this->_out('Q');
	}
}

$pdf=new MYPDF();
$pdf->AddMBFont(GOTHIC ,'SJIS');
//$pdf->SetCompression(false);
$pdf->Open();
$pdf->AddPage();

$pdf->SetTitle("CD/DVD case");
$pdf->SetCreator("CD/DVD case creator");

$width=210;
$height=297;
$discsize = 120;
$space = 1;		//—]”’
$w = ($width-($discsize+2*$space))/2;
$bottomline = $height*3/4;
$midline = $bottomline-($discsize+2*$space);


//ŠG•¿‚ð•`‰æ
if(is_uploaded_file($_FILES['back']['tmp_name'])) {
	$type = '';
	if(preg_match('/\.png$/i', $_FILES['back']['name'])) {
		$type = 'PNG';
	} else if(preg_match('/\.jpe?g$/i', $_FILES['back']['name'])) {
		$type = 'JPG';
	}
	if($type) {
		$pdf->Image($_FILES['back']['tmp_name'],$w+$space,$midline+$space,$discsize,$discsize,$type);
	}
}
if(is_uploaded_file($_FILES['front']['tmp_name'])) {
	$type = '';
	if(preg_match('/\.png$/i', $_FILES['front']['name'])) {
		$type = 'PNG';
	} else if(preg_match('/\.jpe?g$/i', $_FILES['front']['name'])) {
		$type = 'JPG';
	}
	if($type) {
		$pdf->gsave();
		$pdf->concatMatrix(-1,0,0,-1,$width,$height);
		$pdf->Image($_FILES['front']['tmp_name'],$w+$space,$height-$midline+$space,$discsize,$discsize,$type);
		$pdf->Image($_FILES['front']['tmp_name'],$w+$space,$height-$bottomline-$discsize+$space,$discsize,$discsize,$type);
		$pdf->grestore();
	}
}

$yama = array(2,1,0.5,1,0.5,1);
$tani = array(2,1);

//c‚Ìƒ‰ƒCƒ“‚ð•`‰æ
$pdf->SetLinePattern($yama);
$pdf->Line($w,0,$w,$height);
$pdf->Line($width-$w,0,$width-$w,$height);

//ã‚ÌŽÎ‚ßü‚ð•`‰æ
$pdf->SetLinePattern($tani);
$pdf->Line($w,$w,0,0);
$pdf->Line($width-$w,$w,$width,0);
$pdf->SetLinePattern($yama);
$pdf->Line($w,$w,2*$w,0);
$pdf->Line($width-$w,$w,$width-$w*2,0);

//‰º‚Ìü‚ð•`‰æ
$pdf->SetLinePattern($yama);
$pdf->Line($w,$bottomline,$width-$w,$bottomline);
$pdf->SetLinePattern($tani);
$pdf->Line($w,$bottomline,0,$bottomline);
$pdf->Line($width-$w,$bottomline,$width,$bottomline);

$pdf->SetLinePattern($tani);
$pdf->Line($w,$bottomline,0,$bottomline-$w);
$pdf->Line($width-$w,$bottomline,$width,$bottomline-$w);
$pdf->SetLinePattern($yama);
$pdf->Line($w,$bottomline,0,$bottomline+$w);
$pdf->Line($width-$w,$bottomline,$width,$bottomline+$w);

$pdf->SetLinePattern($yama);
$pdf->Line($w,$midline,$width-$w,$midline);
$pdf->SetLinePattern($tani);
$pdf->Line(0,$midline,$w,$midline);
$pdf->Line($width-$w,$midline,$width,$midline);

$pdf->Output();
