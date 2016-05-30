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
		var url = api.active + '&max=10&offset=' + value*10;
		ajax(url, false);
	});
});

var api = {
	base:  'http://api.nal.usda.gov/ndb/',
	key: '&format=json&api_key=iEJf9ZjrUpWcSSKuvekPltYZrO113PbcJxCqvzEC',
	active: '',
	activeLength: ''
}

function inicializacao(){
	hide(['#filterNutrient', '#divTable']);
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

function ajax(url, searchType, getLength){
	$.ajax({
		url: url,
		type: 'GET',
		success: function(data){
			if(getLength){
				var x=(data.list.item.length)/10;
				api.activeLength=Math.ceil(x);
			}
			if(searchType){
				buildModal(data);
			}
			else{
				buildTable(data);
			}
			clearFilterValue();
			show(['#divTable']);
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
	ajax(url, true);
	$('#modalTable').modal();
}

function searchRequest(){
	var url = buildUrl();
	api.active = url;
	ajax(url, false, true);
	$('#result').fadeIn();
}

function nutrientRequest(){

}

function buildTable(data){
	checkTableLength(data);
	var result = '';
	for(var x=0;x<10;x++){
		result += '<tr><td>' + data.list.item[x].ndbno + '</td>';
		result += '<td>' + data.list.item[x].name + '</td>';
		result += '<td>' + data.list.item[x].group + '</td></tr>';
	}
	$('#tableList tbody').html(result);
}

function buildModal(data){
	var result = '';
	for(var x=0;x<data.report.food.nutrients.length;x++){
		result += '<tr><td>' + data.report.food.nutrients[x].name + '</td>';
		result += '<td>' + data.report.food.nutrients[x].value + ' '; 
		result += data.report.food.nutrients[x].unit + '</td>';
	}
	$('#tableReport tbody').html(result);
}