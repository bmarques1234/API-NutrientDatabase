$(document).ready(function(){
    initialization();
    $('#selectFoodNutrient').change(function(){
        updateFilters();
    });
    $('#Search').click(function(){
        checkSelectFilter();
    });
    $('.select').on('click', function(e){
        stopDropdown(e);
    });
    $('#filterID').keypress(onlyNumbers);
    $('#filterNutrient').keypress(onlyNumbers);
    $('#result').on('click', '.tablePg', function(){
        var value = $(this).data('value');
        pagination(value);
    });
    $('#result').on('click', '.glyphicon-search', function(){
        var value = $(this).data('id');
        details(value);
    });
    $(document).keypress(function(e) {
        if (e.which == 13){
            checkSelectFilter();
        }
    })
});

var api = {
    base:  'http://api.nal.usda.gov/ndb/',
    key: '&format=json&api_key=iEJf9ZjrUpWcSSKuvekPltYZrO113PbcJxCqvzEC',
    active: '',
    paginationLength: ''
}

function initialization(){
    hide(['#filterNutrient', '#searchFoodTable', '#searchNutrientTable', '#result h1']);
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

function fade(itens){
    for(var x=0; x<itens.length; x++){
        $(itens[x]).fadeIn();
    }
}

function stopDropdown(e){
    e.stopPropagation();
    e.preventDefault();
}

function scroll(element){
    $('html, body').animate({
        scrollTop: $(element).offset().top
    }, 500);
}

function onlyNumbers(e){
    if ( e.which == 8 || e.which == 0 ) return true;
    if ( e.which < 48 || e.which > 57) return false;
}

function setPaginationLength(length){
    var x=(length)/10;
    api.paginationLength=Math.ceil(x);
}

function clearFilterValue(){
    $('#filterName').val('');
    $('#filterID').val('');
    $('#filterGroup').val('');
    $('#filterNutrient').val('');
}

function checkErrors(data){
    if(data.hasOwnProperty('errors')){
        buildAlertMessage();
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

function itemTable(data, table){
    var item;
    if(table==='#tableFood tbody'){
        item = data.list.item;
    }
    else {
        item = data.report.foods;
    }
    if(item.length<11){
        item.dataLength = item.length;
    }
    else {
        item.dataLength = 10;
    }
    return item;
}

function buildPagination(data){
    var result='';
    for(var c=1;c<api.paginationLength+1;c++){
        result += '<li><a class="tablePg" data-value=' + c + ' href="#result">' + c + '</a></li>';
    }
    $('.pagination').html(result);
}

function buildModalHeader(name, id){
     var result = '<h3 class="modal-title">' + name + '</h3>' + '<h3 class="modal-title">ID: ' + id + '</h3>';
    $('#reportInfo').html(result);
}

function buildAlertMessage(){
    $('#modalError').modal();
    $('#modalTable').modal('hide');
}

function buildUrl(type){
    var url;
    if(type==='Food'){
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
    }
    else {
        if($('#filterNutrient').val()!==''){
            url = api.base + 'nutrients/?nutrients=' + $('#filterNutrient').val() + api.key;
        }
    }
    return url;
}

function buildTable(data, table){
    buildPagination(data);
    var result = '';
    item = itemTable(data, table);
    for(var x=0;x<item.dataLength;x++){
        result += '<tr><td>' + item[x].ndbno + '</td>';
        result += '<td>' + item[x].name + '</td>';
        if(table==='#tableFood tbody'){
            result += '<td>' + item[x].group + '</td>';
        }
        result += '<td><span class="glyphicon glyphicon-search" aria-hidden="true" data-id=' + item[x].ndbno + '></span></td></tr>';
    }
    $(table).html(result);
    scroll('#result');
}

function buildModalTable(data, group){
    var result = '<tr><td class="bg-gray" colspan="3">' + group + '</td></tr>';
    for(var x=0;x<data.report.food.nutrients.length;x++){
        if(data.report.food.nutrients[x].group===group){
            result += '<tr><td>' + data.report.food.nutrients[x].name + '</td>';
            result += '<td>' + data.report.food.nutrients[x].nutrient_id + '</td>';
            result += '<td>' + data.report.food.nutrients[x].value + ' '; 
            result += data.report.food.nutrients[x].unit + '</td>';
        }
    }
    return result;
}

function buildModal(data){
    var result = '';
    buildModalHeader(data.report.food.name, data.report.food.ndbno);
    result += buildModalTable(data, 'Proximates');
    result += buildModalTable(data, 'Minerals');
    result += buildModalTable(data, 'Vitamins');
    result += buildModalTable(data, 'Lipids');
    result += buildModalTable(data, 'Other');
    $('#tableReport tbody').html(result);
}

function ajax(url, searchType, getLength){
    $.ajax({
        url: url,
        type: 'GET',
        success: function(data){
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
    if(getLength){
        setPaginationLength(data.list.item.length);
    }
    if(searchType==='foodReport'){
        buildModal(data);
    }
    else{
        buildTable(data, '#tableFood tbody');
        hide(['#searchNutrientTable']);
        fade(['#searchFoodTable', '#result h1']);
    }
}

function nutrient(data, getLength){
    checkErrors(data);
    if(getLength){
        setPaginationLength(data.report.foods.length);
    }
    buildTable(data, '#tableNutrient tbody');
    hide(['#searchFoodTable']);
    fade(['#searchNutrientTable', '#result h1']);
}

function reportRequest(){
    var url = buildUrl('Food');
    ajax(url, 'foodReport');
    $('#modalTable').modal();
}

function searchRequest(){
    var url = buildUrl('Food');
    api.active = url;
    ajax(url, 'foodSearch', true);
    $('#result').fadeIn();
}

function nutrientRequest(){
    var url = buildUrl('Nutrient');
    api.active = url;
    ajax(url, 'nutrientReport', true);
    $('#result').fadeIn();
}

function pagination(value){
    var url = api.active + '&max=10&offset=' + (value-1)*10;
    if($('#selectFoodNutrient').val()==='Food'){
        ajax(url, 'foodSearch');
    }
    else {
        ajax(url, 'nutrientReport');
    }
}

function details(value){
    var url = api.base + 'reports/?type=b&ndbno=' + value + api.key;
    ajax(url, 'foodReport');
    $('#modalTable').modal();
}