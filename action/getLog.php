<?php
include_once './config.php';
$conn = new mysqli($dbhost, $dbuser, $dbpassword, $dbname);
if ($conn->connect_error) {
    echo "{\"code\":302}";
}else{
    $start="";
    $end="";
    $name="";
    if(isset($_POST["start"])){
        $start = "time>'".$_POST["start"]."'";
    }
    if(isset($_POST["end"])){
        $end = "time<'".$_POST["end"]."'";
    }
    if(isset($_POST["name"])){
        $name = "activity='".$_POST["name"]."'";
    }

    if(isset($_GET["start"])){
        $start = "time>'".$_GET["start"]."'";
    }
    if(isset($_GET["end"])){
        $end = "time<'".$_GET["end"]."'";
    }
    if(isset($_GET["name"])){
        $name = "activity='".$_GET["name"]."'";
    }
    $result_out = array("code"=>200,"list"=>array());
    $sql = "select * from ".$tablename." where ".($name=="" && $start=="" && $end==""?"time>date(now())":($name.($name=="" || $start==""?"":" and ").$start.(($start==""||$end=="")&&($name==""||$end=="")?"":" and ").$end))." order by time asc";
    $result = $conn->query($sql);
    if($result->num_rows>0){
        while($row = $result->fetch_assoc()) {
            array_push($result_out["list"],array("time"=>$row["time"],"name"=>$row["activity"],"message"=>$row["log"]));
            // if($_light){
            //     echo "{".$row["time"]."</td><td>".$row["activity"]."</td><td>".$row["log"]."</td></tr>";
            //     $_light = false;
            // }else{
            //     echo "<tr class=\"light\"><td class=\"nowrap\">".$row["time"]."</td><td>".$row["activity"]."</td><td>".$row["log"]."</td></tr>";
            //     $_light = true;
            // }
        }
        echo json_encode($result_out);
    }else{
        echo "{\"code\":404}";
        echo $sql;
    }
    $conn->close(); 
}
?>