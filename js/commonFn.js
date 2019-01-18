var htmlDialogGlobal = "";
/* 公共函数类  class commonFn */
var commonFn = {
    /*取获Json对象的长度*/
    getJsonLength: function (jsonData) {
        var length = 0;
        for(var ever in jsonData) {
            length ++;
        }
        return length;
   },
    /*行排序*/
    sortByPro: function (pro) {
        return function (a, b) {
            var value1 = a[pro];
            var value2 = b[pro];
            return value1 - value2;
        }
    },
    /*产生随机整数*/
    random: function (lower, upper) {
        return Math.floor(Math.random() * (upper - lower)) + lower;
    },
    /*修改指标选择信息*/
    editEvalKPI: function () {
        commonFn.setEdit();
        $('#saveBtn').removeAttr("disabled");
        $('#confirmBtn').removeAttr("disabled");
        $('#editBtn').attr("disabled", "disabled");
    },
    //样式控制
    cssStyleControl: function(data){
        if(data.length == 0){
            commonFn.setEdit();
        }else{
            commonFn.setReadonly();
        }
    },
    nextKPICollection: function(id){  //htmlDialog为全局变量
        var data = {  //当前kpi的id，需要向后台发送的唯一请求参数
            "parent.id":id
        };
        $.ajax({
            type: 'get',
            url: formUrl.QueryNextKpi,
            dataType: 'json',
            data:data,
            contentType: "application/json; charset=utf-8",
            xhrFields: {
                withCredentials: true
            },
            crossDomain: true,
            async: false,
            success: function (map) {
                if(map.message){
                    $.messager.alert('错误', map.message, 'error');
                }else{
                    $('#dialogContent').dialog('open').html("");
                    var htmlDialog = "";
                    kpiObjectNextGlobal = map;
                    for(var m=0; m < kpiObjectNextGlobal.length; m++){//末级指标评分标准
                        htmlDialog += '<p style="width:300px;">' +
                            '<label>' +  kpiObjectNextGlobal[m].kpiName + '</label> &nbsp;&nbsp;' +
                            '<input type="radio" class="nextKPISelect" id="'+ kpiObjectNextGlobal[m].id + '" name="'+ id +'" value="' + m + '" onclick="commonFn.changeNextKPISelect(this.name,this.value)" />' +
                            '</p>';
                    }
                    htmlDialogGlobal = htmlDialog;
                }
            }
        });
    },
    /*显示下一级待选择末级指标树*/
    showNextKPITree : function(value){
        var id = value.split("num")[0];
        var idNameTextArea = $("#" + value).prev().attr("id");
        var idWeightTextArea = $("#" + value).parent().next().children().attr("id");
        var idStandardTextArea = $("#" + value).parent().next().next().children().attr("id");
        var queryParams={
            parentId: id ,
            nameTextAreaId: idNameTextArea,
            weightTextAreaId: idWeightTextArea,
            standardTextAreaId: idStandardTextArea
        };//值传递
        commonFn.nextKPICollection(id);
        console.log(htmlDialogGlobal);
        var dlg = BootstrapDialog.show({ //用js创建dialog
            title: '末级指标选择',
            message: function() {
                var $content = $( htmlDialogGlobal );
                return $content;
            },
            size : BootstrapDialog.SIZE_SMALL,//size为小，默认的对话框比较宽
            buttons: [{
                label: '保存',
                action:function(){
                    var id = queryParams.parentId; //末级的父级指标id值
                    var idFinalKPIOld = queryParams.nameTextAreaId; //选择前末级的id值，名字单元格id
                    var weightTextAreaIdOld = queryParams.weightTextAreaId; //选择前末级权重值单元格dom元素的id
                    var standardTextAreaIdOld = queryParams.standardTextAreaId; //选择前末级评分标准单元格dom元素的id
                    var idFinalKPI = $("input[name='"+ id +"']:checked").attr('id'); //当前末级指标id值
                    if(idFinalKPI){
                        for(var i=0; i<kpiObjectNextGlobal.length; i++) {
                            if (kpiObjectNextGlobal[i].id == idFinalKPI) {
                                var idFinalKPINew =  "row" + idFinalKPI + "num" + commonFn.random(1,100000); //有可能末级指标重复选择，保证dom元素id值唯一性
                                var weightTextAreaIdNew =  "row" + idFinalKPI + "colWeight" + commonFn.random(1,100000);
                                var standardTextAreaIdNew =  "row" + idFinalKPI + "colStandard" + commonFn.random(1,100000);
                                $('#' + idFinalKPIOld).text(kpiObjectNextGlobal[i].kpiName).attr("id", idFinalKPINew);
                                $('#' + weightTextAreaIdOld).attr("id", weightTextAreaIdNew);
                                $('#' + standardTextAreaIdOld).attr("id", standardTextAreaIdNew);

                                queryParams.nameTextAreaId = idFinalKPINew; //更新
                                queryParams.weightTextAreaId = weightTextAreaIdNew; //更新
                                queryParams.standardTextAreaId = standardTextAreaIdNew; //更新
                                dlg.close();
                            }
                        }
                    }else{
                        //$.messager.alert('信息', '请选择末级指标', 'info');
                        ip.ipInfoJump("请选择数据!","info");
                    }
                },
            }, {
                label: '关闭',
                action:function(){
                    dlg.close();
                }
            }]
        });
    },
    changeNextKPISelect: function(id,value){
        $("input[name='"+ id +"']").each(function(index,domEle){
            if(domEle.value == value){
                $("#"+domEle.id).attr("checked",true);
            }else{
                $("#"+domEle.id).attr("checked",false);
            }
        });
    },
    addTableRow: function(that){
        var id = that.parentNode.className.split(" ")[1].split("Operation")[0];//当前末级指标的父级id
        var num = parseInt(that.parentNode.parentNode.lastChild.innerHTML);//获取是第几行

        //新增一行start
        var trHTML = "<tr>";
        trHTML += '<td class="cc '+ id +'Name'+ (levelNum+1) +'"><textarea id="row' + id + 'colName'+ (levelNum + 1) +'num'+ commonFn.random(1,100000) +'" class="easyui-validatebox name" required="true" ></textarea>&nbsp;' +  //名称列
            '<a class="iconmenu icon-view-detail radioButton" data-toggle="modal" data-target="#dialogContent" id="'+ id  +'num'+ commonFn.random(1,100000) +'" onclick="commonFn.showNextKPITree(this.id)" title="查看"></a>' +
            '</td>';
        trHTML += '<td class="cc '+ id + 'Weight"><textarea id="row' + id + 'colWeight'+ commonFn.random(1,100000) +'" class="easyui-validatebox weight" required="true" onchange="" ></textarea></td>';//权重列
        trHTML += '<td class="aa '+ id + 'Standard" colspan="5"><textarea id="row' + id + 'colStandard'+ commonFn.random(1,100000) +'" class="easyui-validatebox standard" required="true" onchange="" ></textarea></td>';//评分标准列

        trHTML += '<td class="cc '+ id +'Operation" colspan="5">' +
            '<a class="iconmenu icon-edit editButton"  onclick="commonFn.editContent()" title="修改">' +
            '<a class="iconmenu icon-add addButton"  onclick="commonFn.addTableRow(this)" title="增加">' +
            '<a class="iconmenu icon-delete removeButton"  onclick="commonFn.removeTableRow(this)" title="删除">' +
            '</td>';//最后一列操作列
        trHTML += '<td class="serial" colspan="1" style="display:none;"></td>';//序号列
        trHTML += '</tr>';
        //新增一行end
        $("#select_table tr:eq("+ num +")").after(trHTML);

        //修改父级的合并行
        var rowspanOld = $("#"+ id + "Name"+ levelNum).attr("rowspan");
        $("#"+ id + "Name"+ levelNum).attr("rowspan",parseInt(rowspanOld)+1);
        for(var i=0 ;i<evalContent.length; i++){
            if(evalContent[i].id == id){
                for(var j=1; j<levelNum; j++){
                    var parentId = "parentKpi" + j ;
                    var old = $("#"+ evalContent[i][parentId].id + "Name" + j).attr("rowspan");
                    $("#"+ evalContent[i][parentId].id + "Name" + j).attr("rowspan",parseInt(old)+1);
                }
            }
        }
        commonFn.initSerial();//序列号重排
    },
    removeTableRow: function(that){
        var id = that.parentNode.className.split(" ")[1].split("Operation")[0];//当前末级指标的父级id
        var parentKpi;
        var parentKpiChildrenArray =[];
        var tdNumOfDeletedRow;
        //找到其父级
        for(var i=0;i<evalContent.length;i++){
            if(evalContent[i].id == id){
                parentKpi = evalContent[i].parent;
            }
        }
        //找到parentKpi所有的孩子，注意按顺序，依次存入数组parentKpiChildrenArray
        for(var i=0;i<evalContent.length;i++){
            if(evalContent[i].parent.id == parentKpi.id){
                parentKpiChildrenArray.push(evalContent[i]);
            }
        }
        //如果删除的末级行只剩最后一行，只是清空数据不操作，并给出最小删除行的控制提示
        var rowspanOld = parseInt($("#"+ id + "Name"+ levelNum).attr("rowspan"));//目前直接父级的合并行
        if(rowspanOld == 1){
            $.messager.alert('警告', "最后一行无法删除", 'warning');
        }else{
            $.messager.confirm('Confirm','确认删除?',function(r){
                if (r){
                    var missing=[];
                    //保存该行
                    var deletedTR = that.parentNode.parentNode;
                    var TRCollection = deletedTR.children;
                    for(var i=0; i<TRCollection.length - 5; i++){
                        missing.push(TRCollection[i]);//保存删除第一行后下一行缺失的列
                    }
                    //保存下一行
                    var deletedTRNext = deletedTR.nextElementSibling;//至少两行的情况下，该行缺失的是：所有父级
                    //删除该行
                    deletedTR.remove();
                    //如果删除的是第一行，把下一行补齐**********************************************************20181222如何判断删除的是第一行
                    //计算第一行总共的列数
                    if(parentKpiChildrenArray[0].id == id){
                        tdNumOfDeletedRow = levelNum+5; //总共的列数为：指标级次数levelNum+5
                    }else{
                        tdNumOfDeletedRow = levelNum+4; //总共的列数为：指标级次数levelNum+4
                    }
                    if(TRCollection.length == tdNumOfDeletedRow){
                        //把下一行的缺失列补齐
                        for(var m=missing.length - 1; m>=0; m--){
                            deletedTRNext.insertBefore(missing[m],deletedTRNext.children[0]);
                        }
                    }
                    //修改父级的合并行
                    var rowspanOld = $("#"+ id + "Name"+ levelNum).attr("rowspan");
                    $("#"+ id + "Name"+ levelNum).attr("rowspan",parseInt(rowspanOld)-1);
                    for(var i=0 ;i<evalContent.length; i++){
                        if(evalContent[i].id == id){
                            for(var j=1; j<levelNum; j++){
                                var parentId = "parentKpi" + j ;
                                var old = $("#"+ evalContent[i][parentId].id + "Name" + j).attr("rowspan");
                                $("#"+ evalContent[i][parentId].id + "Name" + j).attr("rowspan",parseInt(old)-1);
                            }
                        }
                    }
                    commonFn.initSerial();//序列号重排
                }
            });
        }
    },
    initSerial: function(){
        var i = 1;
        $(".serial").each(function(){
            $(this).html(i++);
        })
    },
    /*提交指标选择信息*/
    submitSaveTaskKpi : function(){
        var saveTaskKpiDataArray = [];
        //把之前数据库中的数据进行逻辑删除
        for(var i=0; i<saveTaskKpiDataArrayResponse.length; i++){
            var taskAPI = {};
            taskAPI["lastModifiedVersion"] = 0;
            taskAPI["createBy"] = "101";
            taskAPI["createDate"] = "2018-11-12T02:31:18.019+0000";
            taskAPI["lastModifiedBy"] = "101";
            taskAPI["lastModifiedDate"] = "2018-11-12T02:31:18.019+0000";
            taskAPI["id"] = saveTaskKpiDataArrayResponse[i].id; //请求参数中有id代表修改操作，无id代表新增操作
            taskAPI["isValid"] = 0;
            saveTaskKpiDataArray.push(taskAPI);
        }
        //要保存到数据库中的所有数据
        $(".serial").each(function(){
            var order_num = parseInt($(this).html());
            var nameDomID = $(this).prev().prev().prev().prev().children().val();
            var weightDomID = $(this).prev().prev().prev().children().attr("id");
            var standardDomID= $(this).prev().prev().children().attr("id");
            var kpi_id = parseInt(weightDomID.split("colWeight")[0].split("row")[1]); //微服务版接口定义，kpi的id是int类型
            if(nameDomID){
                var taskAPI = {};
                taskAPI["lastModifiedVersion"] = 0;
                taskAPI["createBy"] = "101";
                taskAPI["createDate"] = "2018-11-12T02:31:18.019+0000";
                taskAPI["lastModifiedBy"] = "101";
                taskAPI["lastModifiedDate"] = "2018-11-12T02:31:18.019+0000";
                taskAPI["orderNum"] = order_num;
                taskAPI["evalObject"] = { //这个对象值是上流页面带过来的信息
                    "id":1,
                    "lastModifiedVersion":0
                };
                taskAPI["evalTask"] = { //这个对象值是上流页面带过来的信息
                    "id":1,
                    "lastModifiedVersion":0
                };
                taskAPI["kpi"] = {
                    "id":kpi_id,
                    "lastModifiedVersion":0
                };
                taskAPI["kpiWeight"] = $('#' + weightDomID).val();
                taskAPI["kpiStandard"] = $('#' + standardDomID).val();
                taskAPI["remark"] = "";
                taskAPI["isValid"] = 1;
                saveTaskKpiDataArray.push(taskAPI);
            }
        });
        console.log(JSON.stringify(saveTaskKpiDataArray));
        $.ajax({
            type: 'POST',
            url: formUrl.TaskKpi,
            dataType: 'json',
            data: JSON.stringify(saveTaskKpiDataArray),
            contentType: "application/json; charset=utf-8",
            xhrFields: {
                withCredentials: true
            },
            crossDomain: true,
            async: false,
            success: function (map) {
                if(map.message){
                    $.messager.alert('警告', map.message, 'warning');
                }else{
                    commonFn.getSaveTaskKpiDataArray();
                    commonFn.setReadonly();
                    $.messager.alert('信息', '提交成功', 'info');
                }
            }
        });
    },
    /*刷新数据*/
    getSaveTaskKpiDataArray: function () {
        var data = {
            "evalObject.id":1,
            "evalTask.id":1,
            "isValid":1,
            "fetchProperties":"*,kpi[*,parent[id,kpiName,kpiWeight,kpiLevel,kpiExplain],parentKpi1[id,kpiName,kpiWeight,kpiLevel,kpiExplain],parentKpi2[id,kpiName,kpiWeight,kpiLevel,kpiExplain],parentKpi3[id,kpiName,kpiWeight,kpiLevel,kpiExplain],parentKpi4[id,kpiName,kpiWeight,kpiLevel,kpiExplain]]",
            "sort":"orderNum,asc",
            "page":0,
            "size":100000
        };
        $.ajax({
            type: 'GET',
            url: formUrl.TaskKpi,
            dataType: 'json',
            data:data,
            contentType: "application/json; charset=utf-8",
            xhrFields: {
                withCredentials: true
            },
            crossDomain: true,
            async: false,
            success: function (map) {
                if(map.message){
                    $.messager.alert('错误', map.message, 'error');
                }else{
                    saveTaskKpiDataArrayResponse = map;
                    //后台传来的orderNum只能保证大小顺序，不能保证连续和从1排
                    for(var i=0; i<saveTaskKpiDataArrayResponse.length ; i++){
                        saveTaskKpiDataArrayResponse[i].orderNum = i+1;
                    }
                    console.log(saveTaskKpiDataArrayResponse);
                }
            }
        });
    },
    setReadonly:function() {
        $('#select_table input:text[id!=createName]').attr("disabled", "disabled");
        $('#select_table textarea').attr("disabled", "disabled");
        $('.name').attr("disabled", "disabled").css("background-color", "#f8f8f8");
        $('.weight').attr("disabled", "disabled").css("background-color", "#f8f8f8");
        $('.standard').attr("disabled", "disabled").css("background-color", "#f8f8f8");

        $(".editButton").addClass("disabled");
        $(".addButton").addClass("disabled");
        $(".removeButton").addClass("disabled");
        $(".radioButton").addClass("disabled");

    },
    setEdit: function() {
        $('#select_table input:text[id!=createName]').removeAttr("disabled");
        $('#select_table textarea').removeAttr("disabled");
        $('.name').removeAttr("disabled").css("background-color", "#FFFFFF");
        $('.weight').removeAttr("disabled").css("background-color", "#FFFFFF");
        $('.standard').removeAttr("disabled").css("background-color", "#FFFFFF");

        $(".editButton").removeClass("disabled");
        $(".addButton").removeClass("disabled");
        $(".removeButton").removeClass("disabled");
        $(".radioButton").removeClass("disabled");
    }
};
