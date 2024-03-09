// Mod Adjustments when used together with legends
local LegendsPlayerRosterLimit = 27;

::modTQUA.HooksMod.hook("scripts/mods/mod_TQUA/troop_manager", function(q) {
	// Legends-Mod: This function tries to mimic the vanilla setup as seen in the character screen as much as possible
	q.registerPlayerRoster = @() function()
		// Add an entry for the Formation part of the player roster
		this.addManagedRoster("Formation", {
			isActive = function() {return true},
			queryData = function( _this ) {
				return {
					// mName = "Formation",	// We don't display the name so this is not shown
					// mType = "Player",	// this is currently not supported and never displayed anywhere
					mBrotherList = _this.convertActorsToUIData(::World.Assets.getFormation().slice(0, LegendsPlayerRosterLimit)),		// Only pass the first 27 slots of the player roster (because this is the current maximum)
					mBrotherMin = 1,
					mBrotherMax = ::Math.min(LegendsPlayerRosterLimit, ::World.Assets.getBrothersMax()),
					mSlotLimit = LegendsPlayerRosterLimit,
					mAcceptsPlayerCharacters = true,
					mPrimaryDisplayContainer = true,	// These rosters will be displayed in the bottom part of the screen
					mHideHeaderName = true
				}},
			getAll = function() {return ::World.getPlayerRoster().getAll();},
			insertActor = function(_actor) {	// Maybe add Position?
				// Legends specific adjustment. Otherwise we could cheese more people into Frontline than allowed
				if (::World.State.getBrothersInFrontline() >= ::World.Assets.getBrothersMaxInCombat())
				{
					_actor.setInReserves(true);
				}
				else
				{
					_actor.setInReserves(false);
				}
				::World.getPlayerRoster().add(_actor);
				return true;
			},
			removeActor = function(_actor) {
				::World.getPlayerRoster().remove(_actor);
			}
		});
});
