var SelectorGadgetPlusController = function($scope,$http) {

    $scope.fields = [];

    $scope.fieldSeq = 1;

    $scope.selectingFieldIndex = null;

    $scope.addField = function(values) {
        values = values || {};
        this.fields.push({
            name: values.name || 'Field' + this.fieldSeq++,
            css: values.css || '',
            oldCss: values.oldCss || '',
            leaf: values.leaf || 'attr',
            attr: 'innerText',
            results: values.results || [],
            resultsShown: false,
            xpaths: []
        });
    }
    //add example filds
     $scope.fields = [
         {
            name:'template',
            css: '',
            leaf: 'attr',
            attr: 'innerText'
         },
         {
            name:'template_url_regex',
            css: '',
            leaf: 'attr',
            attr: 'innerText'
         },
         {
            name:'template_selector',
            css: '',
            leaf: 'attr',
            attr: 'innerText'
         },
         {
            name:'list.name',
            css: '',
            leaf: 'attr',
            attr: 'innerText'
         },
         {
            name:'list.value',
            css: '' ,
            leaf: 'attr',
            attr: 'innerText'
         }, 
         {
            name:'column_name',
            css: '' ,
            leaf: 'attr',
            attr: 'innerText'
         },
         {
            name:'new_url_selectors.1',
            css: '',
            leaf: 'attr',
            attr: 'href'
         },
         {
            name:'new_url_selectors.2',
            css: '',
            leaf: 'attr',
            attr: 'href'
         }
     ];

    $scope.removeField = function(field) {
        $scope._selectDone(field);
        this.$parent.fields.splice(this.$index, 1);
    }

    $scope.select = function(field) {
        if($scope.selectingFieldIndex !== null) {
            $scope.selectCancel($scope.fields[$scope.selectingFieldIndex]);
        }
        $scope.selectingFieldIndex = this.$index;
        field.selecting = true;
        field.selectingCustom = false;
        field.oldCss = field.css;
        field.oldResults = field.results;
        this.enableSelectorGadget();
    }

    $scope.selectOk = function(field) {
        field.resultsShown = false;
        this._selectDone(field);
    }

    $scope.selectCancel = function(field) {
        field.css = field.oldCss;
        field.results = field.oldResults; 
        this._selectDone(field);
    }

    $scope._selectDone = function(field) {
        $scope.selectingFieldIndex = null;
        field.selecting = false;
        field.selectingCustom = false;
        this.disableSelectorGadget();
    }

    $scope.import = function() {
        var imported = {}
        var input = ""
        try{
            input = prompt('Paste your JSON');
            imported = JSON.parse(input.replace(/\n/g, ''));
        }catch(err){
            imported = JSON.parse(localStorage.getItem(input).replace(/\n/g, ''));
        }

        $scope.fields = [];

        angular.forEach(imported.selectors, function(values, name) {
            $scope.addField({
                name: name,
                css: values.css,
                leaf: values.leaf,
                attr: values.attr
            });
        })
    }

    $scope.export = function() {
        var json = {
            selectors: {}
        };

        angular.forEach($scope.fields, function(value) {
            json.selectors[value.name] = {
                css: value.css,
                leaf: value.leaf,
                attr: value.attr
            }
        });

        var jsonstr = JSON.stringify(json, undefined, 2)

        localStorage.setItem(json.selectors.template.css, jsonstr);

        prompt('Copy this JSON',jsonstr );
    }


/**
    output example: 
    {
        "template":"",
        "template_url_regex" : "",
        "template_selector" : "",

        "list_data" : [{
            "list_name" : "",
            "parent_selector" : "",
            "column_selector" : [{
                "name":"",
                "selector":"",
                "attribute":""
            }]
        }],

        "column_data" : [{
            "name":"",
            "selector":"",
            "attribute":""
        }],

        "new_url_selectors" : [{
            "selector":"",
            "attribute":""
        }]
    }
**/
    $scope.trans = function() {
        var cfg = {
            /*模板名*/
            "template":"",
            /*模板生效条件*/
            "template_url_regex" : "",
            "template_selector" : "",
            /*列表数据*/
            "list_data" : [],
            /*字段数据*/
            "column_data" : [],
            /*链接提取*/
            "new_url_selectors" : []
        }
        
        angular.forEach($scope.fields, function(value) {
                var name = value.name;
                var selector = value.css;
                var attribute = value.leaf;
                if(value.attr && value.attr!=""){
                    attribute = value.attr;
                }

                if(name=='template' || name=='template_url_regex' || name=='template_selector'){
                    cfg[name] = selector;
                }else if(name.indexOf('new_url_selectors')==0){
                    cfg.new_url_selectors.push({
                        "selector":selector,
                        "attribute":attribute
                    })
                }else if(name.indexOf(".")==-1){
                    cfg.column_data.push({
                        "name":name,
                        "selector":selector,
                        "attribute":attribute
                    })
                }else if(name.indexOf(".")>0){
                    var isMerge = false;
                    list_name = name.split(".")[0];
                    column_name = name.split(".")[1];
                    for(var i=0; i<cfg.list_data.length; i++){
                        if(cfg.list_data[i].list_name == list_name){
                            cfg.list_data[i].column_selector.push({
                                "name":column_name,
                                "selector":selector,
                                "attribute":attribute
                            })
                            isMerge = true;
                        }
                    }
                    if(!isMerge)
                        cfg.list_data.push({
                            "list_name" : list_name,
                            "parent_selector" : selector,
                            "column_selector" : [{
                                "name":column_name,
                                "selector":selector,
                                "attribute":attribute
                            }]
                        })
                }
        });

        //generate parent_selector
        for(var i=0; i< cfg.list_data.length; i++){
            common = '';
            parent_selector = cfg.list_data[i].parent_selector;
            columns = cfg.list_data[i].column_selector;

            //find most common string
            var last_seg = 0;
            for(var k=0; k<parent_selector.length;k++){
                var same = true;
                if(parent_selector[k]==">"){
                    last_seg = k;
                }

                for(var j=0; j<columns.length; j++){
                    var selector = columns[j].selector
                    if( k>=selector.length || selector[k]!=parent_selector[k]){
                        same = false;
                        break;
                    }
                }
                if(!same) break;
            }

            //get parent_selector
            common = parent_selector.substring(0,last_seg);
            while(parent_selector[last_seg]=='' || parent_selector[last_seg]=='>')
                last_seg--;
            cfg.list_data[i].parent_selector = parent_selector.substring(0,last_seg+1);

            //get column_selector
            for(var j=0;j<columns.length;j++){
                selector = columns[j].selector;
                columns[j].selector = selector.substring(common.length+1,selector.length);
            }
        }


        URL_TEST_CFG_UPLOAD = '';
        $http.post(URL_TEST_CFG_UPLOAD,JSON.stringify(cfg)).then(function(response){
            console.log(response.data);
        })
    
        prompt('Copy this JSON', JSON.stringify(cfg, undefined, 2));
    }

    // wrappers for communicating with parent window

    $scope.togglePosition = function() {
        parent.postMessage(['sgplus_togglePosition'], '*');
    }

    $scope.disable = function() {
        parent.postMessage(['sgplus_disable'], '*');
    }

    $scope.enableSelectorGadget = function() {
        parent.postMessage(['sgplus_enableSelectorGadget'], '*');
    }

    $scope.disableSelectorGadget = function() {
        parent.postMessage(['sgplus_disableSelectorGadget'], '*');
    }

    $scope.updateLeafAndAttr = function(field) {
        parent.postMessage(['sgplus_updateLeafAndAttr', field.leaf, field.attr], '*');
    }

    $scope.selectCustom = function(field) {
        $scope.selectingFieldIndex = this.$index;
        field.selectingCustom = true;
        parent.postMessage(['sgplus_selectCustom', field.css], '*');
    }

    $scope.highlightResult = function(field, index) {
        parent.postMessage(['sgplus_highlight', field.xpaths[index]], '*');
    }

    $scope.unhighlightResult = function() {
        parent.postMessage(['sgplus_unhighlight'], '*');
    }

    // listen for events from parent window

    window.addEventListener('message', function(e) {
        if((e.data[0] == 'sgplus_updateCssAndResults')
                && ($scope.selectingFieldIndex !== null)) {
            var field = $scope.fields[$scope.selectingFieldIndex];
            // prevent to modify field when typing
            if(!field.selectingCustom) {
                field.css = e.data[1];
            }
            field.results = e.data[2];
            field.xpaths = e.data[3];
            $scope.$digest();
        }
    });
}

