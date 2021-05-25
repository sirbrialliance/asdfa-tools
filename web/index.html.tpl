<!DOCTYPE html>
<html>
<head>
	<meta charset="utf-8">
	<meta name="viewport" content="width=device-width, initial-scale=1.0">
	<title>ASDFA Tools</title>
	<base href="/">
	<link rel="shortcut icon" type="image/svg+xml" href="favicon.svg">
	<style type="text/css">
		.lds-ripple {display: inline-block; position: relative; width: 80px; height: 80px;}
		.lds-ripple div {position: absolute; border: 4px solid #fff; opacity: 1; border-radius: 50%; animation: lds-ripple 1s cubic-bezier(0, 0.2, 0.8, 1) infinite; }
		.lds-ripple div:nth-child(2) {animation-delay: -0.5s;}
		@keyframes lds-ripple {
			0% {top: 36px; left: 36px; width: 0; height: 0; opacity: 1;}
			100% {top: 0px; left: 0px; width: 72px; height: 72px; opacity: 0;}
		}

		#landingLoader, #noscript {position: fixed; top: 20%; text-align: center; width: 100%; font-family: sans-serif; font-size: 20px;}
		#noscript {overflow: hidden; animation: noteReveal 4s steps(7, end); line-height: 1.1em;}
		@keyframes noteReveal { from {height: 1.1em;} to {height: 8.8em;} }
		html {color: white; background: darkblue;}
	</style>

	<noscript>
		<link rel="stylesheet" type="text/css" href="main.css">
	</noscript>
</head>
<body>
	<script type="text/javascript">
		//see loader.js for source:
		{loader}
	</script>
	<noscript>
		<div id="noscript">
			Testing if your browser will run JavaScript...<br>
			...<br>
			...<br>
			...<br>
			Testing complete.<br>
			Results were highly informative:<br>
			It will not.<br>
			Turn off your script blocker to use this page.<br>
		</div>
	</noscript>

	<div id="landingLoader" style="display: none">
		Loading it, the page...<br/>
		<div class="lds-ripple"><div></div><div></div></div>
	</div>
	<script type="text/javascript">document.getElementById("landingLoader").style.display = "";</script>
</body>
</html>

