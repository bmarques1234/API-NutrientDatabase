$(document).ready(function(){
	inicializacao();
	$('#selectFoodNutrient').change(function(){
		updateFilters();
	})
	$('#Search').click(function(){
		checkFilters();
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

function ajax(url){
	$.ajax({
		url: url,
		type: 'GET',
		success: function(data){
			result = data;
			console.log(result);
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
	var url = api.base + 'reports/?type=b&ndbno=' + $('#filterID').val() + api.key;
	ajax(url);  
}

function searchRequest(){
	console.log('search');
	var url = api.base + 'search/?';
	if($('#filterName').val()!==''){
		url += 'q=' + $('#filterName').val() + '&';
	}
	if ($('#filterGroup').val()!==''){
		url += 'fg=' + $('#filterGroup').val();
	}
	url += api.key;
	ajax(url);
}