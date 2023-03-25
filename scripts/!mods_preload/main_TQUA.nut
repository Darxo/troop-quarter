::modTQUA <- {
	ID = "mod_TQUA",
	Name = "Troop Quarter",
	Version = "0.1.0",
	Const = {
		// Vanilla
		MinPlayerRoster = 1,
		PlayerFormationSize = 18,
		PlayerReserveSize = 9,
		PlayerRosterLimit = 27,

		LegendsPlayerRosterLimit = 27
	}
}

::mods_registerMod(::modTQUA.ID, ::modTQUA.Version, ::modTQUA.Name);

::mods_queue(::modTQUA.ID, "mod_msu, >mod_legends, >mod_URUI", function()
{
	::modTQUA.Mod <- ::MSU.Class.Mod(::modTQUA.ID, ::modTQUA.Version, ::modTQUA.Name);

    ::mods_registerJS("mod_TQUA/mod_Assets.js");

    ::mods_registerJS("mod_TQUA/roster_manager_screen/roster_container.js");
    ::mods_registerJS("mod_TQUA/roster_manager_screen/roster_manager.js");
	::mods_registerJS("mod_TQUA/roster_manager_screen/roster_manager_roster_module.js");
    ::mods_registerJS("mod_TQUA/roster_manager_screen/roster_manager_datasource.js");
    ::mods_registerJS("mod_TQUA/roster_manager_screen/roster_manager_screen.js");

	::mods_registerCSS("mod_TQUA/roster_manager_screen/roster_manager_roster_module.css");

	local prefixLen = "ui/mods/".len();
	foreach(file in ::IO.enumerateFiles("ui/mods/mod_TQUA/js_hooks"))
	{
		::mods_registerJS(file.slice(prefixLen) + ".js");
	}

// MSU Keybinds
    ::modTQUA.Mod.Keybinds.addJSKeybind("SwitchToNextSelected", "d", "Switch to next selected", "While in the Roster Manager: select the next actor of the roster that currently has the selection");
    ::modTQUA.Mod.Keybinds.addJSKeybind("SwitchToPrevSelected", "a", "Switch to previous selected", "While in the Roster Manager: select the previous actor of the roster that currently has the selection");
    ::modTQUA.Mod.Keybinds.addJSKeybind("SwitchToAboveSelected", "w", "Switch to next selected", "While in the Roster Manager: select the next actor of the roster that currently has the selection");
    ::modTQUA.Mod.Keybinds.addJSKeybind("SwitchToBelowSelected", "s", "Switch to previous selected", "While in the Roster Manager: select the previous actor of the roster that currently has the selection");

    ::modTQUA.Mod.Keybinds.addJSKeybind("MoveSelectedUp", "shift+w", "Move Selected Up", "While in the Roster Manager: select the next actor of the roster that currently has the selection");
    ::modTQUA.Mod.Keybinds.addJSKeybind("MoveSelectedLeft", "shift+a", "Move Selected Left", "While in the Roster Manager: select the previous actor of the roster that currently has the selection");
    ::modTQUA.Mod.Keybinds.addJSKeybind("MoveSelectedDown", "shift+s", "Move Selected Down", "While in the Roster Manager: select the next actor of the roster that currently has the selection");
    ::modTQUA.Mod.Keybinds.addJSKeybind("MoveSelectedRight", "shift+d", "Move Selected Right", "While in the Roster Manager: select the previous actor of the roster that currently has the selection");

	::modTQUA.Mod.Tooltips.setTooltips({
		RosterModule = {
			RosterSizeLabel = ::MSU.Class.BasicTooltip("Roster Size", "Shows the current and maximum amount of characters for this roster.")
		}
	});

});
