<?php

declare(strict_types=1);

// NOTICE: must run in Command Line from the framework root folder if include util function this way
include_once "../utils/file-converter.php";

// TODO: run this task automatically on server reload/input file change
// option 1: open  this task file in browser when running PHP server live

phpToHtml('../index.php');
phpToHtml('../setting.php');