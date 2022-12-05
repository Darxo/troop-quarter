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


    ::mods_registerJS("mod_TQUA/brother_container.js");
    ::mods_registerJS("mod_TQUA/brother_manager.js");

    ::mods_registerJS("mod_TQUA/troop_quarter_dialog_module.js");
    ::mods_registerCSS("mod_TQUA/troop_quarter_dialog_module.css");
    ::mods_registerJS("mod_TQUA/world_town_screen.js");

    ::mods_registerJS("mod_TQUA/roster_manager/roster_manager_screen.js");



});
