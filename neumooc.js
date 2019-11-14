// ==UserScript==
// @name         NeuMOOC
// @namespace    http://tampermonkey.net/
// @version      0.1
// @description  do other things that more valuable
// @author       You
// run-at       document-start
// @match        www.neumooc.com/course/play/*
// ==/UserScript==

(function () {
    console.log("Happy Mooc");
    function formatTime(time){
        Number.prototype.padLeft = function(total, pad) {
            return (Array(total).join(pad || 0) + this).slice(-total);
        }
        var min = Math.round(time / 60)
        var sec = time % 60
        return min.padLeft(2,0) +":" + sec.padLeft(2,0);
    }
    function doTime(endTime, data, finishFunc, statElem) {
        statElem.innerText = formatTime(data.endSecond) + "/" + formatTime(endTime);
        var i = setInterval(() => {
            if (data.endSecond > endTime) {
                window.clearInterval(i);
                finishFunc();
                return;
            }
            data.endSecond += 30;
            statElem.innerText = formatTime(data.endSecond) + "/" + formatTime(endTime);
            $.post("//www.neumooc.com/course/play/updatePlayInfo", data)
        }, 30000)
    }

    function finishVideo(e) {
        e.stopPropagation()
        e.preventDefault()
        var statElem = this.firstElementChild;
        statElem.innerText = "处理中"
        var courseId = this.href.split("courseId=")[1].split("&")[0]
        var outlineId = this.href.split("outlineId=")[1]
        var resId, entityId;
        $.get(this.href, (data) => {
            var newDocument = (new DOMParser()).parseFromString(data, 'text/html');
            resId = newDocument.getElementById("fResId").value;
            entityId = newDocument.getElementById("fResId").value;
            $.post("//www.neumooc.com/course/play/getOutlineResInfo",
                "resId=" + resId + "&resType=1&outlineId="
                + outlineId + "&courseId=" + courseId + "&entityId="
                + entityId, (data) => {
                    var second = parseInt(data.resInfo.videoSecond) + 1;
                    var videoId = data.resInfo.videoId;
                    $.post("//www.neumooc.com/course/play/addPlayInfo",
                        "videoId=" + videoId + "&startSecond=" + 0
                        + "&courseId=" + courseId + "&outlineId=" + outlineId, (data) => {
                            if (data.isOut != "out") {
                                if (data != null && data.uvId != null) {
                                    var uvId = data.uvId;
                                }
                            } else {
                                window.location.href = getContextPath() + "/login";
                            }
                            var finishFunc = () => {
                                $.post("//www.neumooc.com/course/play/updatePlayInfo", "uvId=" + uvId + "&videoId=" + videoId + "&endSecond=" + second
                                    + "&completeFlag=complete", () => {
                                    this.firstElementChild.innerText = "完成"
                                })
                            }
                            doTime(second, {
                                uvId: uvId,
                                videoId: videoId,
                                endSecond: 0,
                                completeFlag: ""
                            }, finishFunc, statElem);
                        finishFunc();
                        })
                })
        })
    }

    var labels = $("span.label");
    for (var i = 0; i < labels.length; i++) {
        labels[i].firstElementChild.onclick = finishVideo
    }
})();
