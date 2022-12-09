::modTQUA <- {
	ID = "mod_TQUA",
	Name = "Troop Quarter",
	Version = "0.1.0",
	Const = {
		MinPlayerRoster = 1, 		// The game tries to spawn this many Vaults per new map.
		PlayerRosterLimit = 27
	},
	Config = {
		VaultSpaceLimit = 60,	// Maximum amount of slots you can unlock in each Vault
		UnlockedSlots = 5,		// Unlocked Slots at the start
		BaseCost = 100,
		CostPerSlot = 25,	// Cost per already unlocked slot

		IsUnlockedFromNoblesAware = false,	// Access to the vaults unlocks alongside the noble contracts
		ClosedFromSituations = true		// Situation specific can cause the vault to temporarily close
	}
}

::mods_registerMod(::modTQUA.ID, ::modTQUA.Version, ::modTQUA.Name);

::mods_queue(::modTQUA.ID, "mod_msu, >mod_legends, >mod_URUI", function()
{
	::modTQUA.Mod <- ::MSU.Class.Mod(::modTQUA.ID, ::modTQUA.Version, ::modTQUA.Name);

	::includeFiles(::IO.enumerateFiles("mod_TQUA/hooks"));

    // ::mods_registerJS("mod_TQUA/original/mod_stronghold_pokebro_pc_dialog_module.js");
    // ::mods_registerCSS("mod_TQUA/original/mod_stronghold_pokebro_pc_dialog_module.css");

    ::mods_registerJS("mod_TQUA/mod_Assets.js");

    ::mods_registerJS("mod_TQUA/roster_container.js");
    ::mods_registerJS("mod_TQUA/roster_manager.js");

    ::mods_registerJS("mod_TQUA/world_town_screen.js");

	::mods_registerJS("mod_TQUA/roster_manager/roster_manager_roster_module.js");
	::mods_registerCSS("mod_TQUA/roster_manager/roster_manager_roster_module.css");

    ::mods_registerJS("mod_TQUA/roster_manager/roster_manager_datasource.js");
    ::mods_registerJS("mod_TQUA/roster_manager/roster_manager_screen.js");

    ::mods_registerJS("mod_TQUA/screens/character/modules/character_screen_left_panel/character_screen_left_panel_header_module.js");
    ::mods_registerJS("mod_TQUA/screens/character/modules/character_screen_left_panel/character_screen_paperdoll_module.js");

// MSU Keybinds
    // Useful Item Filter
    ::modTQUA.Mod.Keybinds.addJSKeybind("SwitchToNextSelected", "d", "Switch to next selected", "While in the Roster Manager: select the next actor of the roster that currently has the selection");
    ::modTQUA.Mod.Keybinds.addJSKeybind("SwitchToPrevSelected", "a", "Switch to previous selected", "While in the Roster Manager: select the previous actor of the roster that currently has the selection");
    ::modTQUA.Mod.Keybinds.addJSKeybind("SwitchToAboveSelected", "w", "Switch to next selected", "While in the Roster Manager: select the next actor of the roster that currently has the selection");
    ::modTQUA.Mod.Keybinds.addJSKeybind("SwitchToBelowSelected", "s", "Switch to previous selected", "While in the Roster Manager: select the previous actor of the roster that currently has the selection");

    ::modTQUA.Mod.Keybinds.addJSKeybind("MoveSelectedUp", "shift+w", "Move Selected Up", "While in the Roster Manager: select the next actor of the roster that currently has the selection");
    ::modTQUA.Mod.Keybinds.addJSKeybind("MoveSelectedLeft", "shift+a", "Move Selected Left", "While in the Roster Manager: select the previous actor of the roster that currently has the selection");
    ::modTQUA.Mod.Keybinds.addJSKeybind("MoveSelectedDown", "shift+s", "Move Selected Down", "While in the Roster Manager: select the next actor of the roster that currently has the selection");
    ::modTQUA.Mod.Keybinds.addJSKeybind("MoveSelectedRight", "shift+d", "Move Selected Right", "While in the Roster Manager: select the previous actor of the roster that currently has the selection");


	::modTQUA.createGuests <- function()
	{
		if (::World.getGuestRoster().getSize() != 0) return;
		local militia = ::World.getGuestRoster().create("scripts/entity/tactical/humans/militia_guest");
		militia.setFaction(1);
		militia.setPlaceInFormation(19);
		militia.assignRandomEquipment();

		local militia = ::World.getGuestRoster().create("scripts/entity/tactical/humans/militia_guest_ranged");
		militia.setFaction(1);
		militia.setPlaceInFormation(20);
		militia.assignRandomEquipment();

		local militia = ::World.getGuestRoster().create("scripts/entity/tactical/humans/militia_guest");
		militia.setFaction(1);
		militia.setPlaceInFormation(21);
		militia.assignRandomEquipment();

		local militia = ::World.getGuestRoster().create("scripts/entity/tactical/humans/militia_guest_ranged");
		militia.setFaction(1);
		militia.setPlaceInFormation(22);
		militia.assignRandomEquipment();

		local militia = ::World.getGuestRoster().create("scripts/entity/tactical/humans/militia_guest");
		militia.setFaction(1);
		militia.setPlaceInFormation(23);
		militia.assignRandomEquipment();
	}


});
