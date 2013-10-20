<?php

header("Content-Type:text/html;charset=utf-8");

//ユーザエージェントの取得
$useragent = $_SERVER['HTTP_USER_AGENT'];

// スクリプトの現在位置を取得
$location = 'http://' . $_SERVER['HTTP_HOST'] . $_SERVER['REQUEST_URI'];
$location = str_replace("index.php", "", $location);

#DoCoMo
if(strstr($useragent, "DoCoMo")!=FALSE) {
	$location .= 'i/';
}
#Vodafone
else if(strstr($useragent, "Vodafone")!=FALSE) {
	$location .= 'i/';
}
else if(strstr($useragent, "J-PHONE")!=FALSE) {
	$location .= 'i/';
}
else if(strstr($useragent, "MOTO-")!=FALSE) {
	$location .= 'i/';
}
#EZWeb
else if(strstr($useragent, "UP.Browser")!=FALSE) {
	$location .= 'i/';
}
else
{
	readfile('index.html');
	exit();
}
header("Location: $location");
?>
