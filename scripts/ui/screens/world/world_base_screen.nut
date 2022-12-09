this.world_base_screen <- {
	m = {
		JSHandle = null,
		Visible = null,
		Animating = null,
		OnConnectedListener = null,
		OnDisconnectedListener = null,

		// These listeners don't appear in every screen but I wanna list them here anyways
		// OnClosePressedListener = null
		// OnScreenShownListener = null,
		// OnScreenHiddenListener = null,
		// OnLeavePressedListener = null
	},

	// IMPLEMENT/OVERWRITE THIS
	// Generally this queries all data for the purpose of the initialisation of the corresponding js window
	function queryData()
	{
	}

	// NEEDS TO BE CALLED IF OVERWRITTEN
	function create()
	{
		this.m.Visible = false;
		this.m.Animating = false;
	}

	// NEEDS TO BE CALLED IF OVERWRITTEN
	function clearEventListener()
	{
		this.m.OnConnectedListener = null;
		this.m.OnDisconnectedListener = null;
	}

	// Optional Overwrites
	function onScreenConnected()
	{
	}

	function onScreenDisconnected()
	{
	}


	// Basic Helper Functions
	function isVisible()
	{
		return this.m.Visible != null && this.m.Visible == true;
	}

	function isAnimating()
	{
		if (this.m.Animating != null)
		{
			return (this.m.Animating == true);
		}
		else
		{
			return false;
		}
	}

	function setOnConnectedListener( _listener )
	{
		this.m.OnConnectedListener = _listener;
	}

	function setOnDisconnectedListener( _listener )
	{
		this.m.OnDisconnectedListener = _listener;
	}

	function destroy()
	{
		this.clearEventListener();
		this.m.JSHandle = this.UI.disconnect(this.m.JSHandle);
	}

	function show( _withSlideAnimation = false )
	{
		if (this.m.JSHandle != null)
		{
			this.Tooltip.hide();
			this.m.JSHandle.asyncCall("show", this.queryData());
		}
	}

	// Only some hide functions on js side accept a parameter. Namely obituary_screen, event_screen, relations_screen, active_contract_screen. The rest takes no arguments
	// Only exception is world_event_screen. They take two arguments of which the first is eventData. So in this case this function needs to be overwritten
	function hide( _withSlideAnimation = false )
	{
		if (this.m.JSHandle != null)
		{
			this.Tooltip.hide();
			this.m.JSHandle.asyncCall("hide", _withSlideAnimation);
		}
	}

	function onScreenConnected()
	{
		if (this.m.OnConnectedListener != null)
		{
			this.m.OnConnectedListener();
		}
	}

	function onScreenDisconnected()
	{
		if (this.m.OnDisconnectedListener != null)
		{
			this.m.OnDisconnectedListener();
		}
	}

	function onScreenShown()
	{
		this.m.Visible = true;
		this.m.Animating = false;
	}

	function onScreenHidden()
	{
		this.m.Visible = false;
		this.m.Animating = false;
	}

	function onScreenAnimating()
	{
		this.m.Animating = true;
	}

};

