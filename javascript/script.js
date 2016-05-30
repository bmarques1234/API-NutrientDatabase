$(document).ready(function(){
	inicializacao();
	$('#selectFoodNutrient').change(function(){
		updateFilters();
	})
	$('#Search').click(function(){
		checkFilters();
	})
	$('#filterGroup').on('click', function(e){
		stopDropdown(e);
	})
})

var api = {
	base:  'http://api.nal.usda.gov/ndb/',
	key: '&format=json&api_key=iEJf9ZjrUpWcSSKuvekPltYZrO113PbcJxCqvzEC'
}

function inicializacao(){
	hide(['#filterNutrient', '#result']);
}

function hide(itens){
	for(var x=0; x<itens.length; x++){
		$(itens[x]).hide();
	}
}

function show(itens){
	for(var x=0; x<itens.length; x++){
		$(itens[x]).show();
	}
}

function stopDropdown(e){
    e.stopPropagation();
    e.preventDefault();
}

function buildUrl(){
	var url;
	if($('#filterID').val()!==''){
		url = api.base + 'reports/?type=b&ndbno=' + $('#filterID').val() + api.key;
	}
	else{
		url = api.base + 'search/?';
		if($('#filterName').val()!==''){
			url += 'q=' + $('#filterName').val() + '&';
		}
		if ($('#filterGroup').val()!==''){
			url += 'fg=' + $('#filterGroup').val();
		}
		url += api.key;
	}
	return url;
}

function ajax(url, searchType){
	$.ajax({
		url: url,
		type: 'GET',
		success: function(data){
			console.log(data);
			if(searchType===true){
				buildModal(data);
			}
			else{
				buildTable(data);
			}
		}
	})
}

function updateFilters(){
	var valueSelect = $('#selectFoodNutrient').val();
	if(valueSelect==='Food'){
		hide(['#filterNutrient']);
		show(['#filterName', '#filterID', '#filterGroup']);
	}
	else{
		hide(['#filterName', '#filterID', '#filterGroup']);
		show(['#filterNutrient']);
	}
}

function checkFilters(){
	if($('#filterID').val()!==''){
		reportRequest();
	}
	else {
		searchRequest();
	}
}

function reportRequest(){
	console.log('report');
	var url = buildUrl();
	ajax(url, true);
	$('#modalTable').modal();
}

function searchRequest(){
	console.log('search');
	var url = buildUrl();
	ajax(url, false);
	$('#result').fadeIn();
}

function buildTable(data){
	var result = '';
	$('#tableList tbody').html('');
	for(var x=0;x<data.list.item.length;x++){
		result += '<tr><td>' + data.list.item[x].ndbno + '</td>';
		result += '<td>' + data.list.item[x].name + '</td>';
		result += '<td>' + data.list.item[x].group + '</td></tr>';
	}
	$('#tableList tbody').html(result);
}

function buildModal(data){
	var result = '';
	$('#tableReport tbody').html('');
	for(var x=0;x<data.report.food.nutrients.length;x++){
		result += '<tr><td>' + data.report.food.nutrients[x].name + '</td>';
		result += '<td>' + data.report.food.nutrients[x].value + ' '; 
		result += data.report.food.nutrients[x].unit + '</td>';
	}
	$('#tableReport tbody').html(result);
}