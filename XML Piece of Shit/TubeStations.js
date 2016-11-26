$(document).ready(function () {
    $.get("stations.xml", {}, function (xml){
      $title = $xml.find( "Placemark" );
      console.log("LOL");
    });
});
