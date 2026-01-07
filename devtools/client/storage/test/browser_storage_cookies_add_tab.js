/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

// Test to verify TAB navigation when adding a cookie doesn't cause focus to jump
// due to resorting. This test covers the scenario where a user adds a new cookie
// and uses TAB to navigate between fields while editing.

"use strict";

add_task(async function () {
  const TEST_URL = MAIN_DOMAIN + "storage-cookies.html";
  await openTabAndSetupStorage(TEST_URL);
  showAllColumns(true);
  showColumn("uniqueKey", false);

  info("Add a new cookie using the add button");
  const toolbar = gPanelWindow.document.getElementById("storage-toolbar");
  const menuAdd = toolbar.querySelector("#add-button");
  
  await selectTreeItem(["cookies", "http://test1.example.org"]);
  
  const eventEdit = gUI.table.once("row-edit");
  const eventWait = gUI.once("store-objects-edit");
  
  menuAdd.click();
  
  const rowId = await eventEdit;
  await eventWait;
  
  info("Start editing the name field of the newly added cookie");
  await startCellEdit(rowId, "name");
  
  info("Type a name and press TAB to move to the next field");
  await typeWithTerminator("newcookie", "KEY_Tab", false);
  
  // Wait a moment for any sorting to complete
  await new Promise(resolve => setTimeout(resolve, 100));
  
  // Verify that we're now editing the value field, not jumped out
  const editableFieldsEngine = gUI.table._editableFieldsEngine;
  ok(editableFieldsEngine.isEditing, "Still in edit mode after TAB");
  
  const textbox = editableFieldsEngine.textbox;
  const currentColumn = textbox.closest(".table-widget-column");
  is(currentColumn.id, "value", "Focus is on the value field after TAB");
  
  info("Type a value and press TAB to move to the next field");
  await typeWithTerminator("newvalue", "KEY_Tab", false);
  
  // Wait a moment for any sorting to complete
  await new Promise(resolve => setTimeout(resolve, 100));
  
  // Verify that we're still in edit mode and on the next field
  ok(editableFieldsEngine.isEditing, "Still in edit mode after second TAB");
  
  const textbox2 = editableFieldsEngine.textbox;
  const currentColumn2 = textbox2.closest(".table-widget-column");
  is(currentColumn2.id, "host", "Focus is on the host field after second TAB");
  
  info("Complete the edit by pressing Escape");
  EventUtils.synthesizeKey("KEY_Escape", {}, gPanelWindow);
});
