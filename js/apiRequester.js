function regionSelector(commute_location_postcode) {
  const region_postcodes = ["E152RD", "W69LG", "NW36BA", "SW99HR"];
  let bestTravelTime;

  region_postcodes.forEach(eachPostcode => {
    const URL = "https://api.tfl.gov.uk/journey/journeyresults/";
    const travelTime = $http.get(URL + commute_location_postode + "/to/" + eachPostcode).then(response => {
      console.log(JSON.parse(response.data.entries));
    });
    if(typeof(bestTravelTime) === "undefined" || bestTravelTime > travelTime)
      bestTravelTime = travelTime;
  });
}
