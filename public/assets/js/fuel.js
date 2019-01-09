$(function() {

        var editId;
    var file;
    
        $(".file-field :input").change(function(e) {

    for (var i = 0; i < e.originalEvent.srcElement.files.length; i++) {

            file = e.originalEvent.srcElement.files[i];
        console.log(file);

        var img = document.createElement("img");
        var reader = new FileReader();
        reader.onloadend = function() {
             img.src = reader.result;
             
        }
        reader.readAsDataURL(file);

        $("#picField").append(img);

        $("#subButton").css("visibility", "visible");
        $("input").css("visibility", "hidden");

        
        }
    });
    $("#receiptPic").on('submit', function(event) {
      const xhr = new XMLHttpRequest();
      const fd = new FormData();
      
      xhr.open("POST", "/api/image", true);
      xhr.onreadystatechange = function() {
        if (xhr.readyState == 4 && xhr.status == 200) {
          var data = JSON.parse(xhr.responseText);

          var fields = [['place'],
                        ['address'],
                        ['gallons'],
                        ['price', 'total'],
                        ['perGallon']];

          fields.forEach(([key, id = key]) => {
            var value = data[key];
            var el = $('#' + id);

            el.css("visibility", "visible");
            if (value) el.val(value);
          })
        }
      };
      fd.append('myImage', file);
      // Initiate a multipart/form-data upload
      xhr.send(fd);
    })

    $("#add-btn").on('click', function(event) {
        event.preventDefault();

        var newReading = {
            place: $("#place").val().trim(),
            address: $("#address").val().trim(),
            gallons: $("#gallons").val().trim(),
            total: $("#total").val().trim(),
            perGallon: $("#perGallon").val().trim()
        };


        $("#place").val("");
        $("#address").val("");
        $("#gallons").val("");
        $("#total").val("");
        $("#perGallon").val("");

        $.post("/api/readings", newReading).then(function(result) {
    
            console.log(result);
            location.reload();
          });
          
    });

    $(".delete").on("click", function(event) {
        event.preventDefault();
        var id = $(this).attr("id");
        
        $.ajax({
            method: "DELETE",
            url: "/api/delete/" + id
          })
            .then(function(result) {
             console.log("ID: " + result + " deleted"); 
             location.reload();
            });
    });

    $(".edit").on("click", function(event) {
       event.preventDefault();
       editId = $(this).attr("data-edit");
       $.get("/api/find/" + editId).then(function(result) {
           console.log(result);

           $("#edit-btn").css("visibility", "visible");
           $("#add-btn").css("visibility", "hidden");
           
           $("#place").val(result.place);
           $("#address").val(result.address);
           $("#gallons").val(result.gallons);
           $("#total").val(result.price);
           $("#perGallon").val(result.perGallon);
       });
    });

    $("#edit-btn").on("click", function(event) {
        event.preventDefault();

        var editReading = {
            place: $("#place").val().trim(),
            address: $("#address").val().trim(),
            gallons: $("#gallons").val().trim(),
            total: $("#total").val().trim(),
            perGallon: $("#perGallon").val().trim()
        };


        $("#place").val("");
        $("#address").val("");
        $("#gallons").val("");
        $("#total").val("");
        $("#perGallon").val("");
        $.ajax({
            method: "PUT",
            url: "/api/update/" + editId,
            data: editReading
          }).then(function(result) {
              console.log(result);
              location.reload();
          })
        
    });
	    $(".linechart-btn").on("click", function(event) {
        event.preventDefault();
	
		let pricepergallon = [];
		let eachtime = [];
        $.ajax({
            method: "GET",
            url: "/api/pricePerGallon" 
            //data: editReading
          }).then(function(result) {
              console.log(result);
              pricepergallon.push(0);
              eachtime.push(0);               
			  for (var i = 0; i < result.length; i++) 
            {        				        
                pricepergallon.push(result[i].perGallon);   
                eachtime.push(i); 
            }
			
			  console.log(pricepergallon);
        console.log(eachtime);
			  drawChart( eachtime,pricepergallon,"Price Per Gallon");
            		     
    });
	});
	
  
    $(".piechart-btn").on("click", function(event) {
        event.preventDefault();
	
		let gstores = [];
		let gcount = [];
        $.ajax({
            method: "GET",
            url: "/api/storeschart"             
          }).then(function(result) {
              console.log(result)
			    for (var i = 0; i < result.length; i++) 
            {        				        
                gstores.push(result[i].place);   
                gcount.push(result[i].countOfplace); 
            }
			
			drawpie (gcount,gstores);
    });
	});
  
  function drawpie(gc, gp)
  {
	  console.log(gc);
      console.log(gp);
	var ctx = document.getElementById("mchart").getContext('2d');
	// And for a doughnut chart
	var myDoughnutChart = new Chart(ctx, {
    type: 'doughnut',
    data: {
		labels: gp,
		datasets: [{
			data: gc,
			label: "Most Used Stores",
            backgroundColor: [
                'rgba(255, 99, 132, 0.2)',
                'rgba(54, 162, 235, 0.2)',
                'rgba(255, 206, 86, 0.2)',
                'rgba(75, 192, 192, 0.2)',
                'rgba(153, 102, 255, 0.2)',
                'rgba(255, 159, 64, 0.2)',
                'rgba(255, 99, 132, 0.2)',
            ],
            borderColor: [
                'rgba(255,99,132,1)',
                'rgba(54, 162, 235, 1)',
                'rgba(255, 206, 86, 1)',
                'rgba(75, 192, 192, 1)',
                'rgba(153, 102, 255, 1)',
                'rgba(255, 159, 64, 1)',
                'rgba(255, 99, 132, 0.2)',
            ],
            borderWidth: 1
		}]		
	},
    options: {}
});
  }
  
	function drawChart(ea,pg,strChartTitle) 
{
                var ctx = document.getElementById("mchart").getContext('2d');
                 Chart.defaults.global.defaultFontFamily = 'Dosis';
                 Chart.defaults.global.defaultFontSize = 18;
                 Chart.defaults.global.defaultFontColor = '#e8e9e9';
                var chart = new Chart(ctx, {
                    // The type of chart we want to create
                    type: "line",

                    data: {
                        labels: ea,
                        datasets: [{
                            label: strChartTitle,
                            backgroundColor: 'rgb(126, 102, 0)',							
                            borderColor: 'rgb(220, 220, 220)',
                            data: pg,
                        }]
                    },

                    // Configuration options go here
                    options: {}
                });
}
});