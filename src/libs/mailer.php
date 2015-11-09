<?php
function sendMail($mes)
{
	// example on using PHPMailer with GMAIL
	include("PHPMailer/class.phpmailer.php");
	include("PHPMailer/class.smtp.php"); // note, this is optional - gets called from main class if not already loaded

	$err			  = NULL;
	$mail             = new PHPMailer();

	$mail->IsSMTP();
    $mail->SMTPAuth   = true;                                                      // enable SMTP authentication
    $mail->SMTPSecure = "";                                                        // sets the prefix to the servier
	$mail->Host       = "mail.domain";                                             // sets GMAIL as the SMTP server
	$mail->Port       = 25;                                                        // set the SMTP port
	$mail->Username   = "username";                                                // GMAIL username
	$mail->Password   = "password";                                                // GMAIL password
	$mail->From       = "domain@domain.by";                                        // $mes["email"];
    $mail->CharSet	  = "utf-8";
	$mail->FromName   = "Сообщение с сайта | domain.by";                           // $mes["name"]."| domain | ".$type;
	$mail->Subject    = "Поступила новая заявка!";                                 // "Поступил новый ".$type;
	$mail->AltBody    = "This is the body when user views in plain text format";   // Text Body
	$mail->WordWrap   = 50;                                                        // set word wrap
    $mail->Body	      = '
						<div style="font-size: 2em;">'.$mes["title"].'</div>
						<div>Имя: '.$mes["name"].'</div>
						<div>Телефон: '.$mes["phone"].'</div>
						';
    $titleReplyTo = "Ответ на Вашу заявку с сайта [domain]";

	/*$mail->AddReplyTo($mes["email"], $mes["name"]);*/ // "mail@domain","Webmaster"
	//$mail->AddAddress("mail@","О Величайший Мастер");
	$mail->AddAddress("mail@gmail.com", "Отдел продаж");
	$mail->IsHTML(true); // send as HTML

	if(!$mail->Send()) {
		$tmp =  " - Mailer Error: " . $mail->ErrorInfo;
		echo "<p class='bg-danger text-danger'>Произошла ошибка!</p>"; //.$tmp;
	}
	else{
		echo "<p class='text-success bg-success'>Ваше сообщение принято. Хорошего дня!</p>"; //Message has been sent
	}
}
?>
