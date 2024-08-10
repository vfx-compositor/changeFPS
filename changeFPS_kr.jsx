//////////////////////////////////////////////////////////////
// ChangeFPS_v002.jsx 
// by @spicyburrito.aep
// Latest update 2024/08/10
//////////////////////////////////////////////////////////////

{
    function buildUI(thisObj) {
        var panel = (thisObj instanceof Panel) ? thisObj : new Window("palette", "Change FPS", [0, 0, 300, 130], {resizeable:true});
        panel.orientation = "column";
        panel.alignChildren = ["fill", "top"];
        panel.spacing = 10;
        panel.margins = 10;

        // Main group to hold everything
        var mainGroup = panel.add("group");
        mainGroup.orientation = "row";
        mainGroup.alignChildren = ["left", "top"];
        mainGroup.spacing = 10;

        // Left group for FPS controls
        var leftGroup = mainGroup.add("group");
        leftGroup.orientation = "column";
        leftGroup.alignChildren = ["left", "top"];
        leftGroup.spacing = 10;

        var fpsGroup = leftGroup.add("group");
        fpsGroup.orientation = "row";
        fpsGroup.alignChildren = ["left", "center"];
        fpsGroup.spacing = 10;

        fpsGroup.add("statictext", undefined, "Frame Rate:");
        var fpsDropdown = fpsGroup.add("dropdownlist", undefined, ["23.976", "24", "29.97", "30", "59.94", "60", "Custom"]);
        fpsDropdown.selection = 0;

        var customFpsGroup = leftGroup.add("group");
        customFpsGroup.orientation = "row";
        customFpsGroup.alignChildren = ["left", "center"];
        customFpsGroup.spacing = 10;
        customFpsGroup.visible = false;

        customFpsGroup.add("statictext", undefined, "Custom FPS:");
        var customFpsInput = customFpsGroup.add("edittext", undefined, "");
        customFpsInput.characters = 10;

        // Right group for Apply button
        var rightGroup = mainGroup.add("group");
        rightGroup.orientation = "column";
        rightGroup.alignChildren = ["fill", "top"];
        
        var applyButton = rightGroup.add("button", undefined, "Apply");

        fpsDropdown.onChange = function() {
            customFpsGroup.visible = (fpsDropdown.selection.text === "Custom");
            panel.layout.layout(true);
        };

        applyButton.onClick = function() {
            var fps = (fpsDropdown.selection.text === "Custom") ? parseFloat(customFpsInput.text) : parseFloat(fpsDropdown.selection.text);
            if (isNaN(fps) || fps <= 0 || fps > 1000) {  // 1000 fps를 상한선으로 설정
                alert("유효하지 않은 프레임 레이트입니다. 0~1000의 숫자를 입력해주세요.");
                return;
            }
            interpretFootage(fps);
        };

        panel.layout.layout(true);
        panel.layout.resize();
        panel.onResizing = panel.onResize = function () {
            this.layout.resize();
        };

        if (panel instanceof Window) {
            panel.center();
            panel.show();
        }

        return panel;
    }

function interpretFootage(fps) {
    var selectedItems = app.project.selection;
    var activeComp = app.project.activeItem;

    // 타임라인에서 레이어가 선택되었는지 확인
    if (activeComp instanceof CompItem && activeComp.selectedLayers.length > 0) {
        alert("타임라인이 아닌 프로젝트 패널에서 항목을 선택해주세요.");
        return;
    }

    if (selectedItems.length === 0) {
        alert("프로젝트 패널에서 비디오 푸티지 아이템을 선택해주세요.");
        return;
    }

    var videoCount = 0;
    var errorItems = [];

    app.beginUndoGroup("Interpret Footage");

    for (var i = 0; i < selectedItems.length; i++) {
        var item = selectedItems[i];
        if (item instanceof FootageItem) {
            try {
                item.mainSource.conformFrameRate = fps;
                videoCount++;
            } catch (e) {
                // 에러가 발생한 항목의 이름만 저장
                errorItems.push(item.name);
            }
        } else {
            // FootageItem이 아닌 경우도 이름 저장
            errorItems.push(item.name);
        }
    }

    app.endUndoGroup();

    // 결과 메시지 생성
    var resultMessage = videoCount + "개 영상의 프레임 레이트가 " + fps + " fps로 설정되었습니다.\n";
    
    // 변경할 수 없는 항목이 있으면 추가
    if (errorItems.length > 0) {
        resultMessage += "\n다음 항목은 영상이 아니기 때문에 프레임 레이트를 변경할 수 없습니다. \n" + errorItems.join(", ");
    }

    alert(resultMessage);
}

    var myPanel = buildUI(this);
}