$(document).ready(function(){
	inicializacao();
	$('#selectFoodNutrient').change(function(){
		updateFilters();
	})
})

function inicializacao(){
	$('#result').hide();
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