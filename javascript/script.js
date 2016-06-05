$(document).ready(function(){
    initialization();
    $('#selectFoodNutrient').change(function(){
        updateFilters();
    });
    $('#Search').click(function(){
        checkSelectFilter();
    });
    $('.selectDropdown').on('click', function(e){
        $(this).next('ul').toggle();
        stopDropdown(e);
    });
    $('#filterID').keypress(onlyNumbers);
    $('#filterNutrient').keypress(onlyNumbers);
    $('#result').on('click', '.tablePg', function(){
        pagination(this);
    });
    $('#result').on('click', '.glyphicon-search', function(){
        details(this);
    });
    $('.navbar-default').on('click', '#dropdownFilterGroup .dropdown li', function(e){
        checkDropdownItens(this, false, '#filterGroup');
        stopDropdown(e);
    });
    $('.navbar-default').on('click', '#dropdownFilterNutrient .dropdown li', function(e){
        checkDropdownItens(this, true, '#filterNutrient');
        stopDropdown(e);
    });
    $(document).keypress(function(e) {
        if (e.which == 13){
            checkSelectFilter();
        }
    })
});

var api = {
    base:  'http://api.nal.usda.gov/ndb/',
    key: 'format=json&api_key=iEJf9ZjrUpWcSSKuvekPltYZrO113PbcJxCqvzEC',
    active: '',
    paginationLength: '',
    dropdownItensCheckedQuantity: 0
}

function initialization(){
    hide(['#filterNutrient', '#searchFoodTable', '#searchNutrientTable', '#result h1']);
    $('.selectDropdown').next('ul').hide();
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

function scrollPage(element){
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
    clearDropdownItens();
}

function clearDropdownItens(){
    $('.dropdown li').each(function(){
        $(this).data('checked', false);
        $(this).html($(this).data("name") + ' ');
    })
    resetDropdownTitle('#filterGroup');
    resetDropdownTitle('#filterNutrient');
}

function setDropdownTitle(title, titleName){
    $(title).data('name', titleName);
    $(title).html($(title).data('name') + ' <span class="caret"></span>');
}

function resetDropdownTitle(title){
    $(title).data('name', $(title).data('value'));
    $(title).html($(title).data('name') + ' <span class="caret"></span>');
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
        listRequest('Nutrient', 'nutrientReport');
    }
}

function checkFilters(){
    if($('#filterID').val()!==''){
        specificRequest();
    }
    else {
        listRequest('Food', 'foodSearch');
    }
}

function checkDropdownItens(item, enableMultipleValues, title){
    var titleName;
    if(enableMultipleValues===false){
        var c = 1;
    }
    else {
        var c = 3;
    }
    if($(item).data('checked')===false && api.dropdownItensCheckedQuantity<c){
        putItemInDropdownTitle(item, title);
    }
    else if($(item).data('checked')===true){
        eraseItemInDropdownTitle(item, title);
    }
}

function putItemInDropdownTitle(item, title){
    var titleName;
    $(item).append('<span class="glyphicon glyphicon-ok" aria-hidden="true"></span>');
    $(item).data('checked', true);
    if($(title).data('name')===$(title).data('value')){
        titleName = $(item).data('name') + ' ';
    }
    else {
        titleName = $(item).data('name') + ' ' + $(title).data('name');
    }
    setDropdownTitle(title, titleName);
    api.dropdownItensCheckedQuantity++;
}

function eraseItemInDropdownTitle(item, title){
    var titleName;
    var str = $(title).data('name');
    $(item).html($(item).data('name') + ' ');
    $(item).data('checked', false);
    titleName = str.replace($(item).data('name') + ' ', '');
    if(titleName===''){
        titleName = $(title).data('value');
    }
    setDropdownTitle(title, titleName);
    api.dropdownItensCheckedQuantity--;
}

function checkedItens(filterName, parameter){
    var url='';
    $(filterName).each(function(){
        if($(this).data('checked')===true){
            url += parameter + $(this).data('value');
        }
    })
    return url;
}

function updateFilters(){
    var valueSelect = $('#selectFoodNutrient').val();
    if(valueSelect==='Food'){
        hide(['#filterNutrient', '.dropdown']);
        show(['#filterName', '#filterID', '#filterGroup']);
    }
    else{
        hide(['#filterName', '#filterID', '#filterGroup', '.dropdown']);
        show(['#filterNutrient', '#filterNutrient > ul']);
    }
    clearDropdownItens();
    api.dropdownItensCheckedQuantity = 0;
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
        var name = translate();
        if($('#filterID').val()!==''){
            url = api.base + 'reports/?' + api.key + '&type=b&ndbno=' + $('#filterID').val();
        }
        else{
            url = api.base + 'search/?' + api.key;
            if($('#filterName').val()!==''){
                url += '&q=' + name;
            }
            url += checkedItens('#dropdownFilterGroup .dropdown li', '&fg=');
        }
    }
    else {
        url = api.base + 'nutrients/?' + api.key;
        url += checkedItens('#dropdownFilterNutrient .dropdown li', '&nutrients=');
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
    scrollPage('#result');
}

function buildModalTable(data, group){
    var result = '<tr><td class="bg-gray">' + group + '</td><td style="font-size=10px" class="bg-gray">*Values per 100g</td></tr>';
    for(var x=0;x<data.report.food.nutrients.length;x++){
        if(data.report.food.nutrients[x].group===group){
            result += '<tr><td>' + data.report.food.nutrients[x].name + '</td>';
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
    findImage(data.report.food.name);
}

function findImage(name){
    $.ajax({
        url: 'https://bingapis.azure-api.net/api/v5/images/search?q=' + name + '&count=1&offset=0&mkt=en-us&safeSearch=Moderate',
        beforeSend: function(xhrObj){
            xhrObj.setRequestHeader('Ocp-Apim-Subscription-Key','908334a9cf724451b473d998c8433ddf');
        },
        type: "GET",
        data: "{body}",
        success: function(data){
            var result = '<img src="' + data.value[0].contentUrl + '" class="foodImage" />';
            $('#foodImage').html(result);
        }
    })
}

function translate(){
    var result;
    var url = 'https://translate.yandex.net/api/v1.5/tr.json/translate?key=trnsl.1.1.20160602T123405Z.3eeccb01dbaf1181.330bdbcd345984617733c38cc2f333050319585d';
    url += '&text=' + $('#filterName').val() + '&lang=pt-en&[options=1]';
    $.ajax({
        url: url,
        type: 'GET',
        async: false,
        success: function(data){
            result = data.text[0];
        }
    })
    return result;
}

function ajax(url, searchType, getLength){
    $.ajax({
        url: url,
        type: 'GET',
        success: function(data){
            if(searchType==='nutrientReport'){
                nutrientResult(data, getLength);
            }
            else {
                foodResult(data, searchType, getLength);
            }
            clearFilterValue();
        },
        error: function(){
            buildAlertMessage();
            clearFilterValue();
        }
    })
}

function foodResult(data, searchType, getLength){
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

function nutrientResult(data, getLength){
    checkErrors(data);
    if(getLength){
        setPaginationLength(data.report.foods.length);
    }
    buildTable(data, '#tableNutrient tbody');
    hide(['#searchFoodTable']);
    fade(['#searchNutrientTable', '#result h1']);
}

function specificRequest(){
    var url = buildUrl('Food');
    ajax(url, 'foodReport');
    $('#modalTable').modal();
}

function listRequest(type, searchType){
    var url = buildUrl(type);
    api.active = url;
    ajax(url, searchType, true);
    $('#result').fadeIn();
}

function pagination(item){
    var url = api.active + '&max=10&offset=' + ($(item).data('value')-1)*10;
    if($('#selectFoodNutrient').val()==='Food'){
        ajax(url, 'foodSearch');
    }
    else {
        ajax(url, 'nutrientReport');
    }
}

function details(item){
    var url = api.base + 'reports/?'+ api.key + '&type=b&ndbno=' + $(item).data('id') ;
    ajax(url, 'foodReport');
    $('#tableReport tbody').html('');
    $('#foodImage').html('');
    $('#modalTable').modal();
}