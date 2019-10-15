/*
 * Licensed to the Apache Software Foundation (ASF) under one
 * or more contributor license agreements. See the NOTICE file
 * distributed with this work for additional information
 * regarding copyright ownership. The ASF licenses this file
 * to you under the Apache License, Version 2.0 (the
 * "License"); you may not use this file except in compliance
 * with the License. You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing,
 * software distributed under the License is distributed on an
 * "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
 * KIND, either express or implied. See the License for the
 * specific language governing permissions and limitations
 * under the License.
 */

// IMPORTANT! If you modify this file, increase the number after "?v=" in the FreeMarker template!

$(document).ready(function() {
    $("#eval-btn").click(function() {
        execute();
    });
    $('#templateAndModelForm textarea, #templateAndModelForm select').keydown(function (e) {
        if ((e.keyCode == 10 || e.keyCode == 13) && e.ctrlKey) {
            execute();
        }
    });
    $.blockUI.defaults.fadeIn = 1000;
    $.blockUI.defaults.fadeOut = 0;
});

var hasPendingExecuteAjaxCall = false;

function execute() {
    if (hasPendingExecuteAjaxCall || !checkFormSendable()) {
        return;
    }
    
    var request = {
        "template": $("#template").val(),
        "dataModel": $("#dataModel").val(),
        "outputFormat": $("#outputFormat").val(),
        "locale": $("#locale").val(),
        "timeZone": $("#timeZone").val(),
        "tagSyntax": $("#tagSyntax").val(),
        "interpolationSyntax": $("#interpolationSyntax").val(),
    }

    $.ajax({
        method: "POST",
        url: "/api/execute",
        data: JSON.stringify(request),
        headers: { "Content-Type":"application/json" },
        beforeSend: function (jqXHR, options) {
            hasPendingExecuteAjaxCall = true;
            $.blockUI({ message: null });
            $("#error").hide();
            return true;
        }    
    })
    .done(function (data) {
        if (data.problems && data.problems.length != 0) {
            showResult(data.problems[0].message, true);              
        } else {
            showResult(data.result, false);              
        }
    })
    .fail(function (data) {
        if (data.responseJSON) {
        	if (typeof data.responseJSON.errorCode != 'undefined') {
            	showResult(data.responseJSON.errorCode + ": " + data.responseJSON.errorDescription, true);
        	} else {
            	showResult("The service has responded with error:\n"
            			+ "HTTP " + data.status
            			+ (data.responseJSON.message ? ":\n" + data.responseJSON.message : " (No more details available)"),
            			true);
        	}
        } else {
            showResult("The service was unavailable or had returned an invalid response.", true);              
        }
    })
    .always(function (data) {
        hasPendingExecuteAjaxCall = false;
        $.unblockUI();
    });
}

function checkFormSendable() {
    if($.trim($("#template").val()) === "" ) {
        showResult("Template was empty; nothing to do.", true);
        return false;
    }
    return true;
}

function showResult(result, isError) {
    if (isError) {
        $("#result").addClass("error");
    } else {
        $("#result").removeClass("error");
    }

    if( $("#outputFormat").val() === "HTML" ){
        $("#html-result").show();
        $("#result").hide();
        $("#html-result").html(result);
    } else {
        $("#html-result").hide();
        $("#result").show();
        $("#result").val(result);
    }
    $(".resultContainer").show();
    autosize.update($("#result"));
    autosize.update($("#html-result"));
}

//IMPORTANT! If you modify this file, increase the number after "?v=" in the FreeMarker template!
