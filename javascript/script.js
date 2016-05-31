$(document).ready(function(){
	inicializacao();
	$('#selectFoodNutrient').change(function(){
		updateFilters();
	});
	$('#Search').click(function(){
		checkSelectFilter();
	});
	$('#filterGroup').on('click', function(e){
		stopDropdown(e);
	});
	$('#result').on('click', '.tablePg', function(){
		var value = $(this).data('value');
		var url = api.active + '&max=10&offset=' + (value-1)*10;
		if($('#selectFoodNutrient').val()==='Food'){
			ajax(url, 'foodSearch');
		}
		else {
			ajax(url, 'nutrientReport');
		}
	});
});

var api = {
	base:  'http://api.nal.usda.gov/ndb/',
	key: '&format=json&api_key=iEJf9ZjrUpWcSSKuvekPltYZrO113PbcJxCqvzEC',
	active: '',
	activeLength: ''
}

function inicializacao(){
	hide(['#filterNutrient', '#searchFoodTable', '#searchNutrientTable']);
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

function clearFilterValue(){
	$('#filterName').val('');
	$('#filterID').val('');
	$('#filterGroup').val('');
	$('#filterNutrient').val('');
}

function buildModalHeader(name, id){
	var result = '';
	result += '<h3 class="modal-title">' + name + '</h3>';
	result += '<h3 class="modal-title">ID: ' + id + '</h3>';
	$('#reportInfo').html(result);
}

function buildAlertMessage(){
	$('#modalError').modal();
	$('#modalTable').modal('hide');
}

function buildUrl(){
	var url;
	if($('#filterID').val()!==''){
		url = api.base + 'reports/?type=b&ndbno=' + $('#filterID').val() + api.key;
	}
	else if($('#filterNutrient').val()!==''){
		url = api.base + 'nutrients/?nutrients=' + $('#filterNutrient').val() + api.key;
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

function ajax(url, searchType, getLength){
	$.ajax({
		url: url,
		type: 'GET',
		success: function(data){
			console.log(data);
			if(searchType==='nutrientReport'){
				nutrient(data, getLength);
			}
			else {
				food(data, searchType, getLength);
			}
			
			clearFilterValue();
		},
		error: function(){
			buildAlertMessage();
			clearFilterValue();
		}
	})
}

function food(data, searchType, getLength){
	console.log('food');
	if(getLength){
		var x=(data.list.item.length)/10;
		api.activeLength=Math.floor(x);
	}
	if(searchType==='foodReport'){
		buildModal(data);
	}
	else{
		buildTable(data, '#tableFood tbody');
	}
	hide(['#searchNutrientTable']);
	show(['#searchFoodTable']);
}

function nutrient(data, getLength){
	console.log('nutrient');
	if(getLength){
		var x=(data.report.foods.length)/10;
		api.activeLength=Math.floor(x);
	}
	buildTable(data, '#tableNutrient tbody');
	hide(['#searchFoodTable']);
	show(['#searchNutrientTable']);
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

function checkSelectFilter(){
	if($('#selectFoodNutrient').val()==='Food'){
		checkFilters();
	}
	else{
		nutrientRequest();
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

function checkTableLength(data){
	var result='';
	for(var c=1;c<api.activeLength+1;c++){
		result += '<li><a class="tablePg" data-value=' + c + ' href="#result">' + c + '</a></li>';
	}
	$('.pagination').html(result);
}

function reportRequest(){
	var url = buildUrl();
	ajax(url, 'foodReport');
	$('#modalTable').modal();
}

function searchRequest(){
	var url = buildUrl();
	api.active = url;
	ajax(url, 'foodSearch', true);
	$('#result').fadeIn();
}

function nutrientRequest(){
	var url = buildUrl();
	api.active = url;
	ajax(url, 'nutrientReport', true);
	$('#result').fadeIn();
}

function buildTable(data, table){
	checkTableLength(data);
	if(table==='#tableFood tbody'){
		item = data.list.item;
	}
	else {
		item = data.report.foods;
	}
	var result = '';
	var length;
	if(item.length<11){
		length = item.length;
	}
	else {
		length = 10;
	}
	for(var x=0;x<length;x++){
		result += '<tr><td>' + item[x].ndbno + '</td>';
		result += '<td>' + item[x].name + '</td>';
		if(table==='#tableFood tbody'){
			result += '<td>' + item[x].group + '</td></tr>';
		}
	}
	$(table).html(result);
}

function buildModal(data){
	var result = '';
	for(var x=0;x<data.report.food.nutrients.length;x++){
		result += '<tr><td>' + data.report.food.nutrients[x].name + '</td>';
		result += '<td>' + data.report.food.nutrients[x].value + ' '; 
		result += data.report.food.nutrients[x].unit + '</td>';
	}
	$('#tableReport tbody').html(result);
	buildModalHeader(data.report.food.name, data.report.food.ndbno);
}