<?php
include_once './config.php';
$conn = new mysqli($dbhost, $dbuser, $dbpassword, $dbname);
if ($conn->connect_error) {
    echo "{\"code\":302}";
}else{
    $result_out = array("code"=>200,"list"=>array());
    $sql = "select activity as script,date_format(time,'%Y-%m-%d') as date from AutoRun group by activity,date_format(time,'%Y-%m-%d') order by activity,time asc";
    $result = $conn->query($sql);
    if($result->num_rows>0){
        while($row = $result->fetch_assoc()) {
            array_push($result_out["list"],array("script"=>$row["script"],"date"=>$row["date"]));
        }
        echo json_encode($result_out);
    }else{
        echo "{\"code\":404}";
        echo $sql;
    }
    $conn->close(); 
}
?>