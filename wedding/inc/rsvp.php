<?php

    if($_SERVER['REQUEST_METHOD'] != 'POST') {
        echo 'error';
        return;
    }

    if (empty($_POST['firstName']) || empty($_POST['lastName']) || empty($_POST['email']) || empty($_POST['attendingCheck']) || empty($_POST['stayVenueCheck'])) {
        echo 'empty field error';
        return;
    }

//     $dietary = $_POST['vegetarian'].','.$_POST['vegan'].','.$_POST['dairyfree'].','.$_POST['glutenfree'].','.$_POST['nutfree'];

//     $conn = mysqli_connect('localhost', 'ryankshah', 'Alskdjfhg1*', 'shahssince2024');

    $host = 'localhost';
    $db   = 'shahssince2024';
    $user = 'ryankshah';
    $pass = 'Alskdjfhg1*';
    $port = "3306";
    $charset = 'utf8mb4';

    $options = [
        PDO::ATTR_ERRMODE            => PDO::ERRMODE_EXCEPTION,
        PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
        PDO::ATTR_EMULATE_PREPARES   => false,
    ];
    $dsn = "mysql:host=$host;dbname=$db;charset=$charset;port=$port";
    try {
         $pdo = new PDO($dsn, $user, $pass, $options);
    } catch (PDOException $e) {
         throw new PDOException($e->getMessage(), (int)$e->getCode());
    }

    if(empty($_POST['dietary'])) {
        $dietary = 'No Dietary Requirements';
    } else {
        $dietary = '';
        foreach ($_POST['dietary'] as $d) {
            $dietary = $dietary.' '.$d.' ';
        }
    }

    try{
        $stmt = $pdo->prepare('INSERT INTO rsvps (firstName, lastName, email, attending, dietary, stayvenue) VALUES (:firstname, :lastname, :emailAddr, :attending, :dietary, :stayvenue)');
        #($_POST['firstName'], $_POST['lastName'], $_POST['email'], $_POST['attendingCheck'], $dietary, $_POST['stayVenueCheck'])
        $data = array(
            'firstname' => $_POST['firstName'],
            'lastname' => $_POST['lastName'],
            'emailAddr' => $_POST['email'],
            'attending' => $_POST['attendingCheck'],
            'dietary' => $dietary,
            'stayvenue' => $_POST['stayVenueCheck']
        );

        $result = $stmt->execute($data);
        if($result) {
            echo 'You have RSVPed! We cant wait to see you <i class="bi bi-calendar-heart"></i>';
            return;
        } else {
            echo 'error';
            return;
        }
     }
     catch (Exception $e)
     {
        echo $e->getMessage();
        return;
     }

?>