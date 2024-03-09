::modTQUA.Mod.Tooltips.setTooltips({
	Player = {
		RosterTooltip = ::MSU.Class.CustomTooltip(function( _data ){
			// _data contains the data EntityId and RosterId (Player Roster consist of the RosterId's "Formation" and "Reserve")
			local entity = this.Tactical.getEntityByID(_data.EntityId);

			if (entity != null)
			{
				return entity.getRosterTooltip();
			}
		})
	},
});
