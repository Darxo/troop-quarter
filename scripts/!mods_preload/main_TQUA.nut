::modTQUA <- {
	ID = "mod_TQUA",
	Name = "Troop Quarter",
	Version = "0.1.1",
	Const = {
		// Vanilla
		MinPlayerRoster = 1,
		PlayerFormationSize = 18,
		PlayerReserveSize = 9,
		PlayerRosterLimit = 27,

		LegendsPlayerRosterLimit = 27
	}
}

::modTQUA.HooksMod <- ::Hooks.register(::modTQUA.ID, ::modTQUA.Version, ::modTQUA.Name);
::modTQUA.HooksMod.require(["mod_msu"]);

::modTQUA.HooksMod.queue(">mod_msu, >mod_legends, >mod_URUI", function()
{
	::modTQUA.Mod <- ::MSU.Class.Mod(::modTQUA.ID, ::modTQUA.Version, ::modTQUA.Name);

	::include("mod_TQUA/load");		// Load mod adjustments and other hooks
	::include("mod_TQUA/ui/load");		// Load JS Adjustments and Hooks

// MSU Keybinds

	::modTQUA.Mod.Tooltips.setTooltips({
		RosterModule = {
			RosterSizeLabel = ::MSU.Class.BasicTooltip("Roster Size", "Shows the current and maximum amount of characters for this roster.")
		}
	});

});
