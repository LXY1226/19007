// ==UserScript==
// @name         NeuMOOC
// @namespace    http://tampermonkey.net/
// @version      0.15
// @description  do other things that more valuable
// @author       You
// @match        www.neumooc.com/course/play/*
// ==/UserScript==

(function () {
    var rush = false,
        labels = $("span.label"),
        threads = 5,
        videos = [];

    console.log("Happy Mooc");

    function formatTime(time) {
        Number.prototype.padLeft = function (total, pad) {
            return (Array(total).join(pad || 0) + this).slice(-total);
        }
        var min = parseInt(time / 60)
        var sec = time % 60
        return min.padLeft(2, 0) + ":" + sec.padLeft(2, 0);
    }

    function doTime(endTime, data, finishFunc, statElem) {
        statElem.innerText = formatTime(data.endSecond) + "/" + formatTime(endTime);
        var i = setInterval(() => {
            data.endSecond += 30;
            if ((data.endSecond + 30) > endTime) {
                window.clearInterval(i);
                finishFunc((endTime - data.endSecond) * 1000);
                return;
            }
            statElem.innerText = formatTime(data.endSecond) + "/" + formatTime(endTime);
            $.post("//www.neumooc.com/course/play/updatePlayInfo", data)
        }, 30000)
    }

    function startRush(e) {
        e.stopPropagation()
        e.preventDefault()
        for (var i = 0; i < threads; i++) {
            finishVideo(videos.pop())
        }
    }

    function initVideo(labels, i) {
        var a = labels[i].firstElementChild,
            statElem = a.firstElementChild;
        a.onclick = startRush;
        a.data = {}
        a.data.courseId = a.href.split("courseId=")[1].split("&")[0];
        a.data.outlineId = a.href.split("outlineId=")[1];
        //获取已观看时间
        $.post("//www.neumooc.com/course/play/getOutlineInfoAjax",
            "outlineId=" + a.data.outlineId + "&courseId=" + a.data.courseId,
            (data) => {
                a.data.doneTime = parseInt(data.RET_OBJ.viewVideoTime);
                //获取视频信息
                $.get(a.href, (data) => {
                    var newDocument = (new DOMParser()).parseFromString(data, 'text/html');
                    a.data.resId = newDocument.getElementById("fResId").value;
                    a.data.entityId = newDocument.getElementById("fResId").value;
                    //获取视频时间、ID
                    $.post("//www.neumooc.com/course/play/getOutlineResInfo",
                        "resId=" + a.data.resId + "&resType=1&outlineId="
                        + a.data.outlineId + "&courseId=" + a.data.courseId + "&entityId="
                        + a.data.entityId, (data) => {
                            if (i < labels.length) {
                                initVideo(labels, i + 1)
                            }
                            a.data.fullTime = parseInt(data.resInfo.videoSecond) + 1;
                            a.data.videoId = data.resInfo.videoId;
                            if (a.data.doneTime >= a.data.fullTime) {
                                statElem.innerText = "全部完成"
                            } else {
                                if (isNaN(a.data.doneTime)) {a.data.doneTime = 0;}
                                console.log(a.data.doneTime)
                                statElem.innerText = formatTime(a.data.doneTime) + "/" + formatTime(a.data.fullTime)
                                a.parentElement.className = "label bg-color-orange"
                                videos.push(a)
                            }
                        })
                })
            })

    }

    function finishVideo(a) {
        let startTime = parseInt(a.data.doneTime / 30) * 30
        a.parentElement.className = "label bg-color-blue"
        setTimeout(
            $.post("//www.neumooc.com/course/play/addPlayInfo",
                "videoId=" + a.data.videoId + "&startSecond=0&courseId="
                + a.data.courseId + "&outlineId=" + a.data.outlineId, (data) => {
                    if (data.isOut != "out") {
                        if (data != null && data.uvId != null) {
                            a.data.uvId = data.uvId;
                        }
                    } else {
                        window.location.href = getContextPath() + "/login";
                    }
                    var finishFunc = (endTime) => {
                        setTimeout(() => {
                            $.post("//www.neumooc.com/course/play/updatePlayInfo",
                                "uvId=" + a.data.uvId + "&videoId=" + a.data.videoId + "&endSecond=" + a.data.fullTime
                                + "&completeFlag=complete", () => {
                                    a.firstElementChild.innerText = "全部完成";
                                    a.parentElement.className = "label bg-color-green"
                                });
                            finishVideo(videos.pop())
                        }, endTime);
                    };
                    () => {
                        doTime(a.data.fullTime, {
                            uvId: a.data.uvId,
                            videoId: a.data.videoId,
                            endSecond: startTime,
                            completeFlag: ""
                        }, finishFunc, a.firstElementChild);
                    }
                }), parseInt(Math.random() * 30000))
    }

    initVideo(labels, 0);
})();
