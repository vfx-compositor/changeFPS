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

    // Check if layers are selected in the timeline
    if (activeComp instanceof CompItem && activeComp.selectedLayers.length > 0) {
        alert("Please select items in the project panel, not in the timeline.");
        return;
    }

    if (selectedItems.length === 0) {
        alert("Please select video footage items in the project panel.");
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
                // Store only the name of items that caused an error
                errorItems.push(item.name);
            }
        } else {
            // Store names of items that are not FootageItems
            errorItems.push(item.name);
        }
    }

    app.endUndoGroup();

    // Generate result message
    var resultMessage = videoCount + " video(s) have been set to " + fps + " fps.\n";
    
    // Add information about items that couldn't be changed
    if (errorItems.length > 0) {
        resultMessage += "\nThe following items could not have their frame rate changed because they are not video footage: \n" + errorItems.join(", ");
    }

    alert(resultMessage);
}

var myPanel = buildUI(this);
}