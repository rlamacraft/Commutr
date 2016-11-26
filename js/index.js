$(document).ready(function() {
	var minhousemates = 2;
	var maxhousemates = 8;
	var housemates = 2;

	$("#housemate-add").click(function(){
		if(housemates < 8){
			console.log("add");
			housemates++;
			console.log(housemates);
			addHousemate(housemates);
		}else{
			window.alert("How big do you think houses are in London?!");
		}
	});

	$("#housemate-remove").click(function(){
		if(housemates > 2){
			console.log("remove");
			removeHousemate(housemates);
			housemates--;
		}else{
			window.alert("You need someone to live with?!");
		}
	});
});

function addHousemate(housemates) {
	$("#housemate-form").append('<div id="housemate-entry-'+housemates+'" class="form-group housemate-entry">'+
		'<label for="housemates-'+housemates+'">Housemate '+housemates+'</label>'+

		'<div class="input-group">'+
			'<span class="input-group-addon" id="basic-addon1">Commute To...</span>'+
			'<input type="text" class="form-control" placeholder="Postcode" aria-describedby="basic-addon1">'+
		'</div>');
}

function removeHousemate(housemates){
	$("#housemate-entry-"+housemates).remove();
}
