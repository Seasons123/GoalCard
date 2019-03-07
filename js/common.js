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
    addTableRow: function(that){
        var id = that.parentNode.className.split(" ")[1].split("Operation")[0];//当前末级指标的父级id
        var num = parseInt(that.parentNode.parentNode.lastChild.innerHTML);//获取是第几行
        //新增一行start
        var numRandom = commonFn.random(1,100000);
        var numRandomWeight = commonFn.random(1,100000);
        var numRandomUnit = commonFn.random(1,100000);
        var trHTML = "<tr>";
        //左表
        htmlTargetToBeSelectedEmpty = '<td class="cc '+ id +'Name'+ (levelNum+1) +'" style="border-right:0;">' +
            '<textarea  class="kpiObjectFinalNextSpan name row' + id + 'colName'+ (levelNum + 1) +'num'+ numRandom + '"></textarea>';//名称列
        trHTML += htmlTargetToBeSelectedEmpty;
        trHTML += '</td><td style="border-left:0;">';
        trHTML +=  '<a class="iconmenu icon-view-detail radioButton" data-toggle="modal" data-target="#dialogContent" id="'+ id  +'num'+ commonFn.random(1,100000) +'" onclick="showNextKPIInfo(this.id)" title="查看"></a>' +
            '</td>';
        trHTML += '<td class="cc '+ id +'Weight"><textarea id="row' + id + 'colWeight'+ numRandomWeight +'" class="weight" required="true" onchange="" ></textarea></td>';//指标值列
        trHTML += '<td class="cc '+ id +'Unit"><textarea id="row' + id + 'colUnit'+ numRandomUnit +'" class="unit" required="true" onchange="" ></textarea></td>';//单位列
        //右表
        //trHTML += domKpiObjectFinal[0].outerHTML;
        htmlTargetToBeSelectedEmpty = '<td class="cc '+ id +'Name'+ (levelNum+1) +'" style="border-right:0;">' +
            '<textarea  class="kpiObjectFinalNextSpan name row' + id + 'colName'+ (levelNum + 1) +'num'+ numRandom + ' "></textarea>';//名称列
        trHTML += htmlTargetToBeSelectedEmpty;
        trHTML += '</td><td style="border-left:0;">';
        trHTML +=  '<a class="iconmenu icon-view-detail radioButton" data-toggle="modal" data-target="#dialogContent" id="'+ id  +'num'+ commonFn.random(1,100000) +'" onclick="showNextKPIInfo(this.id)" title="查看"></a>' +
            '</td>';
        trHTML += '<td class="cc '+ id +'Weight"><textarea id="row' + id + 'colWeight'+ numRandomWeight +'" class="weight" required="true" onchange="" ></textarea></td>';//指标值列
        trHTML += '<td class="cc '+ id +'Unit"><textarea id="row' + id + 'colUnit'+ numRandomUnit +'" class="unit" required="true" onchange="" ></textarea></td>';//单位列
        trHTML += '<td class="cc '+ id +'Operation" colspan="5">' +
            '<a class="iconmenu icon-input addButton"  onclick="commonFn.addTableRow(this)" title="增加"></a>' +
            '<a class="iconmenu icon-delete removeButton"  onclick="commonFn.removeTableRow(this)" title="删除"></a>' +
            '</td>';//最后一列操作列
        trHTML += '<td class="serial" colspan="1" style="display:none;"></td>';//序号列
        trHTML += '</tr>';
        //新增一行end
        $("#select_table tr:eq("+ (num+1) +")").after(trHTML);

        //修改父级的合并行
        var rowspanOld = $("."+ id + "Name"+ levelNum).attr("rowspan");
        $("."+ id + "Name"+ levelNum).attr("rowspan",parseInt(rowspanOld)+1);
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
        var rowspanOld = parseInt($("."+ id + "Name"+ levelNum).attr("rowspan"));//目前直接父级的合并行
        if(rowspanOld == 1){
            ip.ipInfoJump("最后一行无法删除","error");
        }else{
            ip.warnJumpMsg('确认删除？',"saveConfirmSureId","saveConfirmCancelCla");
            $('#saveConfirmSureId').on('click',function(){
                //一.如果删除的是第一行，需要进行的处理
                var deletedTR = that.parentNode.parentNode;//保存该行
                var TRCollection = deletedTR.children;
                var TRCollectionLength = TRCollection.length; //运行完deletedTRNext.insertBefore(missing[missing.length - 1],deletedTRNext.children[4]); TRCollection的长度会自动减1，不知道为何
                var deletedTRNext = deletedTR.nextElementSibling;//保存下行，至少两行的情况下，该行缺失的是：左表是所有父级，右表是末级
                //如果删除的是第一行，把下一行补齐**********************************************************20181222如何判断删除的是第一行
                //计算第一行总共的列数
                if(parentKpiChildrenArray[0].id == id){
                    tdNumOfDeletedRow = levelNum+11; //总共的列数为：指标级次数levelNum+11
                }else{
                    tdNumOfDeletedRow = levelNum+10; //总共的列数为：指标级次数levelNum+10
                }
                if(tdNumOfDeletedRow == TRCollectionLength){//如果删除的是第一行
                    var missing=[];
                    for(var i=0; i<TRCollection.length - 11; i++){
                        missing.push(TRCollection[i].cloneNode(true));//保存删除第一行后下一行缺失的列
                    }
                    //把下一行的缺失列补齐
                    for(var m=missing.length - 1; m>=0; m--){
                        deletedTRNext.insertBefore(missing[m].cloneNode(true),deletedTRNext.children[0]);
                    }
                    if(parentKpiChildrenArray[0].id == id){
                        deletedTRNext.insertBefore(missing[missing.length - 1].cloneNode(true),deletedTRNext.children[6]);
                    }else{
                        deletedTRNext.insertBefore(missing[missing.length - 1].cloneNode(true),deletedTRNext.children[5]);
                    }

                }
                //二.删除该行
                deletedTR.remove();
                //三.修改父级的合并行
                var rowspanOld = $("."+ id + "Name"+ levelNum).attr("rowspan");
                $("."+ id + "Name"+ levelNum).attr("rowspan",parseInt(rowspanOld)-1);
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
                $('#config-modal').remove();
            });
            $('.saveConfirmCancelCla').on('click',function(){
                $('#config-modal').remove();
            });
        }
    },
    initSerial: function(){
        var i = 1;
        $(".serial").each(function(){
            $(this).html(i++);
        })
    },

    //暂存或保存：总体目标+绩效目标
    saveGaolInfo: function(){
        var saveGoal = {
            "goal":{},
            "goalVer":{},
            "goalKpiList":[]
        };
        //第一步：保存goal对象的信息
        var goalTS = {};
        goalTS["obj"] = 2;  //评价对象的id，同getBasicInfo方法中的id
        goalTS["objType"] = basicInfoDataGlobal.objType; //评价类型
        goalTS["setYear"] = Number($('#year').val()); //当前年度
        saveGoal.goal = goalTS;

        //第二步：保存goalVer对象的信息
        var goalVerTS = {};
        goalVerTS["starDate"] = $('#yearStart').val(); //开始时间
        goalVerTS["endDate"] = $('#yearEnd').val(); //结束时间
        goalVerTS["yearGoal"] = $('#yearGoalContent').val();  //中期目标内容
        goalVerTS["mtGoal"] = $('#mtGoalContent').val(); //年度目标内容
        saveGoal.goalVer = goalVerTS;

        //第三步：保存goalKpiList数组对象的信息
        //把之前数据库中的数据进行逻辑删除
       /* for(var i=0; i<saveGaolKpiDataArrayResponse.length; i++){
            var taskAPI = {};
            taskAPI["lastModifiedVersion"] = saveGaolKpiDataArrayResponse[i].lastModifiedVersion;
            taskAPI["id"] = saveGaolKpiDataArrayResponse[i].id; //请求参数中有id代表修改操作，无id代表新增操作
            taskAPI["dataStatus"] = 0;
            saveGoal.goalKpiList.push(taskAPI);
        }*/
        //要保存到数据库中的所有数据（每次保存都是新增）
        $(".serial").each(function(){
            var order_num = parseInt($(this).html());
            var nameDomID = $(this).prev().prev().prev().prev().prev().children().val(); //指标名称列
            var weightDomClass = $(this).prev().prev().prev().children().attr("class"); //中期目标值列、年度目标值列的class
            var unitDomClass = $(this).prev().prev().children().attr("class"); //目标单位列
            var kpi_id = parseInt(weightDomClass.split("colWeight")[0].split("row")[1]); //微服务版接口定义，kpi的id是int类型
            if(nameDomID){
                var taskAPI = {};
                taskAPI["displayOrder"] = order_num;
                taskAPI["kpi"] = kpi_id;
                taskAPI["mtGoalVal"] = $($('.' + weightDomClass)[0]).val();//中期目标值
                taskAPI["goalVal"] = $($('.' + weightDomClass)[1]).val();//年度目标值
                //taskAPI["unit"] = $('#' + unitDomClass).val(); //暂时不保存这个字段
                taskAPI["dataStatus"] = 1; //1是有效，0是删除
                taskAPI["remark"] = $('#' + unitDomClass).val(); //暂时把单位存入备注中
                saveGoal.goalKpiList.push(taskAPI);
            }
        });
        console.log(JSON.stringify(saveGoal));
        $.ajax({
            type: 'POST',
            url: formUrl.SaveGaol,
            dataType: 'json',
            data: JSON.stringify(saveGoal),
            contentType: "application/json; charset=utf-8",
            xhrFields: {
                withCredentials: true
            },
            crossDomain: true,
            async: false,
            success: function (map) {
                if(map.message){
                    ip.ipInfoJump(map.message,"error");
                }else{
                    //commonFn.getSaveTaskKpiDataArray();
                    ip.ipInfoJump("提交成功","info");
                }
            }
        });
    },


    /*保存所有信息*/
    saveAll : function(that){
        var draftFlag; //草稿的字段：draft，暂存是：0，保存时：1
        if(that == "temSave"){
            draftFlag = 0;
        }else if (that == "saveAll"){
            draftFlag = 1;
        }
        //一、暂存或保存：基本情况
        basicInfoDataGlobal["supDep"] = basicInfoDataGlobal.supDep.id;
        basicInfoDataGlobal["agency"] = basicInfoDataGlobal.agency.id;
        basicInfoDataGlobal["objAttr"] = Number($('#attribute').val());
        basicInfoDataGlobal["name"] = $('#projectId').html();
        basicInfoDataGlobal["mfAmount"] = $('#financeGrant').val();
        basicInfoDataGlobal["moAmount"] = $('#otherGrant').val();
        basicInfoDataGlobal["mtAmount"] = $('#totalMoney').html();
        basicInfoDataGlobal["yfAmount"] = $('#yearFinanceGrant').html();
        basicInfoDataGlobal["yoAmount"] = $('#yearOtherGrant').val();
        basicInfoDataGlobal["ytAmount"] = $('#yearTotalMoney').html();
        basicInfoDataGlobal["objYears"] = $('#projectPeriod').val();
        basicInfoDataGlobal["draft"] = draftFlag;
        $.ajax({
            type: 'post',
            url: formUrl.BasicInfo,
            dataType: 'json',
            data:JSON.stringify(basicInfoDataGlobal),
            contentType: "application/json; charset=utf-8",
            xhrFields: {
                withCredentials: true
            },
            crossDomain: true,
            async: false,
            success: function (data) {
                if(data.message){
                    $.messager.alert('错误', data.message, 'error');
                }else{
                    //alert("基本情况保存成功");
                    commonFn.saveGaolInfo();
                }
            }
          });
    },
    /*刷新数据*/
    getSaveTaskKpiDataArray: function () {
        var data = {
            "dataStatus":1,
            "fetchProperties":"*,goalVer[*],kpi[*]",
            "sort":"orderNum,asc",
            "page":0,
            "size":100000
        };
        $.ajax({
            type: 'GET',
            url: formUrl.GoalKpi,
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
                    ip.ipInfoJump(map.message,"error");
                }else{
                    saveGaolKpiDataArrayResponse = map;
                    //后台传来的orderNum只能保证大小顺序，不能保证连续和从1排
                    for(var i=0; i<saveGaolKpiDataArrayResponse.length ; i++){
                        saveGaolKpiDataArrayResponse[i].orderNum = i+1;
                    }
                    console.log(saveGaolKpiDataArrayResponse);
                }
            }
        });
    },
    totalMoneyCalculate: function() {
        $('#totalMoney').html(parseFloat($('#financeGrant').val()) + parseFloat($('#otherGrant').val())); //中期总金额实时计算
    },
    yearMoneyCalculate: function() {
        $('#yearTotalMoney').html(parseFloat($('#yearFinanceGrant').html()) + parseFloat($('#yearOtherGrant').val())); //中期总金额实时计算
    }
};
