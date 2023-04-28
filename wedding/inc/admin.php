<?php
        require_once('protect.php');

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
?>


<!doctype html>
<html lang="en">
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <meta name="description" content="Ryan and Claire's Wedding">
    <meta name="author" content="Ryan Shah">
    <title>Claire &amp; Ryan's Wedding - June 3rd 2024</title>

    <link href="../css/bootstrap.min.css" rel="stylesheet">
    <link href="https://cdn.datatables.net/1.13.3/css/jquery.dataTables.css">
    <link href="../css/style.css" rel="stylesheet">

    <!-- Favicons -->
    <!--    <link rel="apple-touch-icon" href="/docs/5.3/assets/img/favicons/apple-touch-icon.png" sizes="180x180">-->
    <!--    <link rel="icon" href="/docs/5.3/assets/img/favicons/favicon-32x32.png" sizes="32x32" type="image/png">-->
    <!--    <link rel="icon" href="/docs/5.3/assets/img/favicons/favicon-16x16.png" sizes="16x16" type="image/png">-->
    <!--    <link rel="manifest" href="/docs/5.3/assets/img/favicons/manifest.json">-->
    <!--    <link rel="mask-icon" href="/docs/5.3/assets/img/favicons/safari-pinned-tab.svg" color="#712cf9">-->
    <!--    <link rel="icon" href="/docs/5.3/assets/img/favicons/favicon.ico">-->
    <!--    <meta name="theme-color" content="#712cf9">-->
</head>

<body>
<main>
    <!-- nav -->
    <nav class="navbar navbar-light navbar-expand-md bg-faded justify-content-center navbar-expand-lg bg-white" style="border-bottom: 1px solid #f2f2f2;">
        <div class="container">
            <a href="index.html" class="navbar-brand d-flex w-50 me-auto">Claire &amp; Ryan</a>
            <button class="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#collapsingNavbar3">
                <span class="navbar-toggler-icon"></span>
            </button>
            <div class="navbar-collapse collapse w-100" id="collapsingNavbar3" style="font-size: 18px;">
                <ul class="navbar-nav w-100 justify-content-end">
                    <li class="nav-item">
                        <a class="nav-link" href="index.html">Home</a>
                    </li>
                    <li class="nav-item">
                        <a class="nav-link" href="about.html">Our Story</a>
                    </li>
<!--                    <li class="nav-item">-->
<!--                        <a class="nav-link" href="party.html">The Wedding Party</a>-->
<!--                    </li>-->
                    <li class="nav-item">
                        <a class="nav-link" href="schedule.html">Schedule</a>
                    </li>
                    <li class="nav-item">
                        <a class="nav-link" href="savethedate.html">Save The Date</a>
                    </li>
                    <li class="nav-item">
                        <a class="nav-link" href="rsvp.html">RSVP</a>
                    </li>
                    <li class="nav-item">
                        <a class="nav-link" href="accommodation.html">Accommodation</a>
                    </li>
                    <li class="nav-item">
                        <a class="nav-link" href="index.html#faq">FAQ</a>
                    </li>
                </ul>
            </div>
        </div>
    </nav>

    <!-- content -->
    <div class="container" style="background-color: #fefefe; border: 1px solid #f2f2f2; border-top: none; padding: 0; border-bottom: none;">
        <div class="row align-items-center g-lg-5 p-5 p-md-5 text-center">
            <div><h1 class="display-6" style="display: inline-block; border-bottom: 2px solid #e1c4ff; margin-bottom: 0;">RSVP</h1></div>
            <div class="col-12 col-sm-12 col-xs-12 align-items-center text-center" style="margin-left: auto; margin-right: auto;">
                <div class="table-responsive">
                  <table class="table" id="sortedTable">
                      <thead>
                          <tr>
                            <th scope="col">First</th>
                            <th scope="col">Last</th>
                            <th scope="col">Email</th>
                            <th scope="col">Attending</th>
                            <th scope="col">Dietary</th>
                            <th scope="col">Wishes to Stay at Venue?</th>
                          </tr>
                      </thead>
                      <tbody>
                          <?php
                                $stmt = $pdo->prepare("SELECT * FROM rsvps");
                                $stmt->execute();
                                $result = $stmt->fetchAll();

                                foreach($result as $row) {
                          ?>
                        <tr>
                            <td><?php echo $row['firstName']; ?></td>
                            <td><?php echo $row['lastName']; ?></td>
                            <td><?php echo $row['email']; ?></td>
                            <td><?php echo $row['attending']; ?></td>
                            <td><?php echo $row['dietary']; ?></td>
                            <td><?php echo $row['stayvenue']; ?></td>
                        </tr>
                          <?php
                                }
                          ?>
                      </tbody>
                  </table>
                </div>
            </div>
        </div>
    </div>
</main>

<script src="../js/jquery.min.js"></script>
<script src="../js/bootstrap.bundle.min.js"></script>
<script src="https://cdn.datatables.net/1.13.3/js/jquery.dataTables.js"></script>
<!--<script src="js/site.js"></script>-->
<script>
$(document).ready( function () {
    $('#sortedTable').DataTable({
        columnDefs: [
                {
                    targets: [0],
                    orderData: [0, 1],
                },
                {
                    targets: [1],
                    orderData: [1, 0],
                },
                {
                    targets: [4],
                    orderData: [4, 0],
                },
            ],
    });
} );
</script>
</body>
</html>
