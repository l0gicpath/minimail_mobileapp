Backbone.View.prototype.close = function (notRemove) {
	if (this.beforeClose) {
		this.beforeClose();
	}

	// Empty of HTML content, but don't remove the parent element
	// this.$el.empty();
	if(notRemove){
		// this.remove();
		clog('emptied, not removed');
		this.$el.empty();
	} else {
		this.remove();
	}
	this.unbind();

	// clog('removing VIEW');

	// this.off(); // same thing??

};


Backbone.View.prototype.garbage = function (view_list) {
	// Trash views that are not currently needed

	// passes in a view_list of things to trash

};


// Minimail prototypes
Backbone.View.prototype.resize_fluid_page_elements = function () {
	// Handles the default page elements resizing
	// - dynamic height for "body" element

	// Get height of elements on the page

	var that = this;

	// elements to check
	var elements = [
		'.header',
		'.footer',
		'.footer2'
	];

	var $bodyContainer;

	// Get this (or parent) body_container
	if(this.$('.body_container').length > 0){
		$bodyContainer = this.$('.body_container');
	} else {
		$bodyContainer = this.$el.parents('.body_container');
	}

	if($bodyContainer.length < 1){
		// Unable to locate .body_container
		// alert('unable to locate body container');
	}

	var used_height = 0;
	$.each(elements,function(i, elemClass){
		if($bodyContainer.parent().find(elemClass + ':not(.nodisplay)').length > 0){
			used_height += $bodyContainer.parent().find(elemClass).outerHeight();
		}
	});

	// Get remaining height
	// - subtract used_height from xy.win_height
	var remaining_height = App.Data.xy.win_height - used_height;

	// Update body_container with fixed_height

	// this element or a child of the one we're fixing?
	$bodyContainer.css('height',remaining_height + 'px');
	
	// Update individual elements in body
	// - margin, etc.


};

Backbone.View.prototype.resize_scroller = function () {
	// Resize the scroller inside this element
	var that = this;

	// Calculate max-height for scroll
	// - based on parent
	var $scroller = this.$('.scroller'),

		// Get fixed_height of element above (usually .body_container.fixed_height)
		$fixed = $scroller.parents('.fixed_height');
		max_height = $fixed.height(); // could have it stored as a data-attribute instead?

	
	if(this.$el.hasClass('reverse_vertical')){
		this.$el.css('height',max_height + 'px');
	} else {
		this.$('.reverse_vertical').css('height',max_height + 'px');
	}
	this.$('.scroller').css('max-height',max_height + 'px');
	this.$('.scroller').css('width',App.Data.xy.win_width + 'px');

	return;
};



App.Views.Body = Backbone.View.extend({
	
	// el: 'body',
	className: 'main_body',

	events: {
		'click #refresh_people' : 'refresh_people',
		// 'click .logout' : 'logout',
		'click .goto_senders' : 'goto_senders',

		'click .base_header_menu .threads_change button' : 'menu_click',
		'dblclick .base_header_menu .threads_change button' : 'dblmenu_click',

		'click .base_header_menu .logo' : 'settings',

		'click .base_header_menu button[data-action="compose"]' : 'compose'
	},

	initialize: function() {
		var that = this;
		_.bindAll(this, 'render');

		// Start listening for update events to the counts

		App.Events.on('Main.UpdateCount',this.updateCount, this); // not yet invoked anywhere

	},

	updateCount: function(data){
		// Updates the count for one of the displayed now,due,later

		// Convert types
		if(data.type == 'delayed'){
			data.type = 'now';
		}
		if(data.type == 'later'){
			data.type = 'later';
		}
		if(data.type == 'undecided'){
			data.type = 'dunno';
		}

		// console.log(data);

		if(data.count == 10){
			data.count = "10<sup>+</sup>";
		}

		var $button = this.$('.base_header_menu .threads_change button[data-action="'+data.type+'"]');

		// Remove any previous one
		$button.find('.counter').remove();

		// Create template
		var template = App.Utils.template('t_thread_counter');

		// Add to button
		$button.append(template({count: data.count}));
		
		return false;

	},


	logout: function(){
		Backbone.history.loadUrl('confirm_logout');
	},


	goto_senders: function(ev){
		// Load the senders page
		Backbone.history.loadUrl('senders');
		return false;
	},

	set_scroll_position: function(){
		var that = this;

		// Set last scroll position
		this.last_scroll_position = $('.threads_holder').scrollTop();
		this.$el.attr('last-scroll-position',this.last_scroll_position);

	},


	menu_click: function(ev){
		var elem = ev.currentTarget;

		// Get ID of btn
		var id = $(elem).attr('data-action');

		// Make other buttons inactive
		this.$('.base_header_menu button').removeClass('active');

		// Activate this button
		$(elem).addClass('active');

		// Store scroll position
		this.set_scroll_position();

		// Launch router for undecided, delayed, all, leisure, collections
		Backbone.history.loadUrl(id);

		return false;

	},


	dblmenu_click: function(ev){
		// trying to figure out a "force-refresh" type of approach
		return;

		// var elem = ev.currentTarget;

		// // Get ID of btn
		// var id = $(elem).attr('data-action');

		// // Make other buttons inactive
		// this.$('.base_header_menu button').removeClass('active');

		// // Activate this button
		// $(elem).addClass('active');

		// // Store scroll position
		// this.set_scroll_position();

		// // Launch router for undecided, delayed, all, leisure, collections
		// Backbone.history.loadUrl(id);

		// return false;

	},

	settings: function(ev){
		// Launch settings
		// - double-tap on logo
		console.log('settings');

		var that = this,
			elem = ev.currentTarget;

		Backbone.history.loadUrl('settings');

		return false;

	},

	compose: function(ev){
		// Compose a new email

		// Store scroll position
		this.set_scroll_position();

		// Launch router for undecided, delayed, all, leisure, collections
		Backbone.history.loadUrl('compose');

	},


	render: function() {

		var that = this;

		// Data
		// var data = this.options.accounts.UserGmailAccounts;

		// Should start the updater for accounts
		// - have a separate view for Accounts?


		// Template
		var template = App.Utils.template('t_body');

		// Write HTML
		$(this.el).html(template());

		// Fix fluid layout
		this.resize_fluid_page_elements();

		// Load the Undecided View
		// Backbone.history.loadUrl('undecided');
		var doclick = 'dunno';
		this.$('.base_header_menu button[data-action="'+doclick+'"]').addClass('active');
		Backbone.history.loadUrl(doclick);
		// this.$('.base_header_menu button[data-action="'+doclick+'"]').trigger('touchend');

		return this;
	},


	refresh_people: function(){
		// Refresh people

		// Get the current list of people
		var that = this;
		// var dfd = $.Deferred();

		Api.count({
			data: {
				model: 'Email',
				conditions: {
					"$or" : [
						{
							"app.AppMinimalContact.version" : {
								"$lt" : App.Credentials.data_version // versioning
							}
						},
						{
							"app.AppMinimalContact.version" : {
								"$exists" : false // doesn't even exist
							}
						}
					]
				}
			},
			success: function(count_res){
				count_res = JSON.parse(count_res);
				$('#refresh_people').attr('data-total',count_res.data);
				$('#refresh_people').attr('data-togo',count_res.data);
				// dfd.resolve(count_res);
				that.search_again();
			}

		});

		return false;
	},


	search_again: function(){

		var that = this;

		// Iterate through emails
		// - one's we haven't already processed
		// - eventually, do this server-side

		// Count total emails we haven't processed
		var dfd_count = $.Deferred();

		Api.count({
			data: {
				model: 'Email',
				conditions: {
					"$or" : [
						{
							"app.AppMinimalContact.version" : {
								"$lt" : App.Credentials.data_version // versioning
							}
						},
						{
							"app.AppMinimalContact.version" : {
								"$exists" : false // doesn't even exist
							}
						}
					]
				}
			},
			success: function(count_res){
				count_res = JSON.parse(count_res);
				$('#refresh_people').attr('data-togo',count_res.data);
				dfd_count.resolve(count_res);
			}

		});
		dfd_count.promise().then(function(count_res){
			
			var possible = ['To','Delivered-To','From','Cc','Bcc','Reply-To'];
			var header_fields = [];
			$.each(possible,function(i,v){
				// header_fields.push('original.headers.' + v);
				header_fields.push('original.headers.' + v + '_Parsed');
			});

			// Iterate through all emails
			// - go backwards, use a limit
			var dfd_email_search = $.Deferred();
			var fields = ["common"].concat(header_fields);

			Api.search({
				data: {
					model: 'Email',
					conditions: {
						"$or" : [
							{
								"app.AppMinimalContact.version" : {
									"$lt" : App.Credentials.data_version // versioning
								}
							},
							{
								"app.AppMinimalContact.version" : {
									"$exists" : false // doesn't even exist
								}
							}
						]
					},
					fields: fields,
					limit: App.Credentials.email_collect_limit,
					sort: {
						"common.date_sec" : -1
					}
				},
				queue: true,
				success: function(email_res){
					dfd_email_search.resolve(email_res);
				}
			});
			dfd_email_search.then(function(email_res){

				var email_res = JSON.parse(email_res);
				if(email_res.code != 200){
					clog('Failed getting emails');
					return;
				}

				// Parse out all the people

				// Listen for another window starting the process
				// - immediately cancels anything we are saving
				// - todo...

				// Possible places addresses are held
				var addresses = [];

				$.each(email_res.data,function(i,email){

					$.each(possible,function(k,type){
						var type_parsed = type + '_Parsed';
						if (typeof email.Email.original.headers[type_parsed] == 'undefined'){
							// Not a valid one to parse
							return;
						}

						var addr = email.Email.original.headers[type_parsed];

						// Iterate through type Parsed ones now
						$.each(addr,function(j,parsedAddress){

							// Valid email address?
							var email_address = $.trim(parsedAddress[1]);
							if (/^((([a-z]|\d|[!#\$%&'\*\+\-\/=\?\^_`{\|}~]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])+(\.([a-z]|\d|[!#\$%&'\*\+\-\/=\?\^_`{\|}~]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])+)*)|((\x22)((((\x20|\x09)*(\x0d\x0a))?(\x20|\x09)+)?(([\x01-\x08\x0b\x0c\x0e-\x1f\x7f]|\x21|[\x23-\x5b]|[\x5d-\x7e]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(\\([\x01-\x09\x0b\x0c\x0d-\x7f]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF]))))*(((\x20|\x09)*(\x0d\x0a))?(\x20|\x09)+)?(\x22)))@((([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])*([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])))\.)+(([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])*([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])))$/i.test(email_address)){
								// Passed validation
								clog('Pass: ' + email_address);
							} else {
								clog('====FAILED validation: ' + email_address);
								return;
							}
							// Add to array
							addresses.push({
								type: type,
								name: $.trim(parsedAddress[0]),
								email_address: email_address,
								email_id: email.Email._id
							});
						});

					});
				});

				// Update the users after each batch of users we process
				// - so we can show incremental process to the user (update the percentage parsed)

				// This should be handled by a model

				// Check each address against the database, determine if they should be updated or not

				var dfds = [];
				$.each(addresses,function(i,address){
					// Iterate through each
					// - ignore the names if they already match
					var dfd_find_contact = $.Deferred();
					var tmp_dfd = $.Deferred();
					Api.search({
						data: {
							model: "AppMinimalContact",
							conditions: {
								"email" : address.email_address,
								"live" : 1
							},
							fields: [],
							limit: 1
						},
						queue: true,
						success: function(contact_res){
							dfd_find_contact.resolve(contact_res);
						}
					});
					dfd_find_contact.then(function(res){
						res = JSON.parse(res);
						if(res.code != 200){
							clog('Failed finding user');
							return;
						}

						tmp_dfd.resolve();

						if(res.data.length < 1){

							// Found anyone?
							var data  = {
											model: "AppMinimalContact",
											event: "AppMinimalContact.new",
											obj: {
												name: address.name,
												email: address.email_address,
												emails: {},
												groups: [],
												approved: 0,
												live: 1
											}
										};
							// clog(address);
							data.obj.emails[address.type] = [address.email_id];

							// No one with this email
							Api.write({
								data: data,
								queue: true,
								success: function(contact_res){
									contact_res = JSON.parse(contact_res);
									if(contact_res.code != 200){
										clog('Failed saving AppMinimalContact');
										return;
									}
								}
							});
						} else {
							// Found a contact with this email
							// clog('Found contact with this email');

							// Does this type exist?
							if(typeof res.data[0].AppMinimalContact.emails[address.type] == 'undefined'){
								// Write type, with this email.id as the first referenced
								var updateData = {
											id: res.data[0].AppMinimalContact._id,
											model: 'AppMinimalContact',
											paths: {
												"$set" : {
													emails : {}
												}
											}
										};
								updateData.paths["$set"].emails[address.type] = [address.email_id]
								var dfd_update_contact = $.Deferred();
								Api.update({
									data: updateData,
									queue: true,
									success: function(update_res){
										dfd_update_contact.resolve(update_res);
									}
								});
								dfd_update_contact.then(function(update_res){
									update_res = JSON.parse(update_res);
									if(update_res.code != 200){
										clog('-- Failed updating contact');
										return;
									}
								});

								return;
							} else {
								// Type already exists
								// - see if this email_id is already in there
								clog('Finish update script in views.js!!');
							}


						}

					});
		
					// Return a promise that
					dfds.push(tmp_dfd.promise());

					// clog(addresses);
					// clog(addresses.length);

				});

				$.when.apply(this,dfds)
					.then(function(){
						// See if we need to reload anybody else
						
						// Mark these emails to the correct new version
						var email_ids = []; // extract the email ids and do an update
						$.each(email_res.data,function(i,email){
							email_ids.push(email.Email._id);
						});

						var update_dfd = $.Deferred();
						Api.update({
							data: {
								model: 'Email',
								conditions: {
									"_id" : {
										"$in" : email_ids
									}
								},
								paths: {
									"$set" : {
										"app.AppMinimalContact.version" : App.Credentials.data_version
									}
								}
							},
							success: function(update_email_res){
								update_dfd.resolve();
							}
						});

						update_dfd.promise()
							.then(function(){
								if(email_res.data.length < 1){
									clog('Got all emails!');
									that.search_reconcile();
									return;
								}

								clog('== Time to load more emails!!');
								window.setTimeout(function(){
									that.search_again();
								},2000);
							});

					});

				// After all the data for these emails is stored, go get the next batch of emails
				// Save these as completed

				// if(email_res.data.length > 0){
				// 	// Keep going
				// 	window.setTimeout(function(){
				// 		clog('Searching Again');
				// 		that.search_again();
				// 	},10000);
				// }

			});



		});


		// var do_emails = true;
		// while(do_emails){

		// 	var defer = $.defer();

		// 	Api.search({
		// 		data: {
		// 			model: 'AppMinimalContact',
		// 			paths: [],
		// 			conditions: {},
		// 			limit: 10000
		// 		}
		// 	})

		// }

		return false;
	},

	search_reconcile: function(){
		// Handle duplicates, etc in the AppMinimalContacts
		// - 

		// Get all contacts
		var dfd = $.Deferred();

		Api.search({
			data: {
				model: 'AppMinimalContact',
				paths: [],
				conditions: {

					"live" : 1
				},
				limit: 10000
			},
			queue: true,
			success: function(res){
				// required for a queue
				dfd.resolve(res);
			}
		});

		dfd.promise()
			.then(function(res){
				res = JSON.parse(res);
				if(res.code != 200){
					clog('failed reconciling');
					return;
				}

				var contacts = res.data;

				// 
				for(var i =0; i< contacts.length ; i++){
					for(var j=i+1; j<contacts.length;j++){
						if(i == j){
							// comparing itself
							continue;
						}
						if(contacts[i].AppMinimalContact.email == contacts[j].AppMinimalContact.email){//found matching first 2 chars

							// Merge each of the AppMinimalContact.emails fields (the _Parsed fields)
							// $.each(contacts[j].AppMinimalContact.emails,function(key,val){

							// });

							// contacts[i] = contacts[i].substring(0,3) + contacts[j].replace(/\{(.*?)\}/,"$1 ;") + contacts[i].substring(4);

							// Remove the second id from the database
							Api.remove({
								data: {
									model: 'AppMinimalContact',
									id: contacts[j].AppMinimalContact._id
								},
								success:function(res){
									res = JSON.parse(res);
									clog('Removed: ' + res.data);
								}
							});

							//remove the doup and decrease the counter so you don't skip one now that the array is shorter
							clog('dupe: ' + contacts[i].AppMinimalContact.email);
							contacts.splice(j--,1);

						}
					}
				}

				clog('Finished Reconciling');

				// $.each(contacts,function(key,val){
				// 	clog(val.AppMinimalContact.email);
				// });

			});




	}
});


App.Views.CommonThread = Backbone.View.extend({
	
	className: 'common_thread_view is-loading',

	events: {
		'click .btn[data-action="back"]' : 'go_back',
		'click .btn[data-action="delay"]' : 'click_delay',
		'click .btn[data-action="done"]' : 'click_done',
		'click .btn[data-action="pin"]' : 'click_pin',
		'click .btn[data-action="leisure"]' : 'click_leisure',

		'click .reply' : 'reply',
		'click .forward' : 'forward',

		'click .email_holder .email_body .ParsedDataShowAll span.expander' : 'email_folding',
		'click .email_holder .email_body .ParsedDataShowAll span.edit' : 'edit_email'
	},

	initialize: function(options) {
		_.bindAll(this, 'render');
		_.bindAll(this, 'render_thread');
		_.bindAll(this, 'email_sent');
		_.bindAll(this, 'go_back');

		// _.bindAll(this, 'refresh_and_render_thread');
		var that = this;
		// this.el = this.options.el;

		// Get any local information we have
		// After getting local info, and if we have enough, show the thing
		// Get remote info, merge with Local when it arrives

		// Get the Thread

		// Render the information we have on this Thread
		this.threadid = this.options.threadid

		// // build the data
		// var data = {
		// 	Thread: App.Data.Store.Thread[this.threadid],
		// 	Email: _.filter( App.Data.Store.Email,function(email){
		// 			if(email.attributes.thread_id == that.threadid) return true;
		// 		})
		// };

		// // Sort Email
		// data.Email = App.Utils.sortBy({
		// 	arr: data.Email,
		// 	path: 'common.date_sec',
		// 	direction: 'asc',
		// 	type: 'num'

		// });

		// Get Full Thread
		this.threadFull = new App.Models.ThreadFull({
			_id: this.options.threadid
		});

		// Checking if the Thread is ready to be displayed
		// - seeing if it actually should be displayed too
		this.threadFull.on('check_display_ready', function(){

			// Must have Full ready
			if(!that.threadFull.FullReady || !that.threadFull.EmailReady){
				// console.warn('thread.check_display_ready = not ready');
				return;
			}
			// Already rendered this Thread?
			if(that.threadFull.Rendered){
				// Show the change in the view
				console.warn('Already rendered (need to change the view!)');
				return;
			}
			that.threadFull.Rendered = true;

			// Render the view!
			that.render_thread();

		}, this);

		// Listen for "change" event
		this.threadFull.on('change', function(threadFull){
			// Mark thread as ready
			// - this fires immediately if anything is cached
			// - otherwise it fires if something is different from the cached version
			if(!that.threadFull.FullReady){
				that.threadFull.FullReady = true;
				that.threadFull.trigger('check_display_ready');
			}
		}, this);

		this.threadFull.fetchFull();

		// Emails for Thread
		// - we want to know after all the emails have been loaded for the Thread
		this.threadEmails = new App.Collections.EmailsFull();

		this.threadEmails.on('reset', function(){
			// never fires, what the fuck!!!!
			console.log('reset, NEVER FUCKING FIRES');
			if(!that.threadFull.EmailReady){
				that.threadFull.EmailReady = true;
				that.threadFull.trigger('check_display_ready');
			}
		}, this); // completely changed collection (triggers add/remove)

		this.threadEmails.on('sync', function(threadFull){
			// Fires after add/remove have completed?
			// console.info('EmailSync');
			if(this.threadEmails.length && !that.threadFull.EmailReady){
				that.threadFull.EmailReady = true;
				that.threadFull.trigger('check_display_ready');
			}
		}, this); // completely changed collection (triggers add/remove)

		this.threadEmails.on('add', function(emailFullModel){
			// Got a new email while the view is displayd, probably want to show a "display new email" type of popup (like gmail)
			// console.log('EmailAdd');
			// console.log(emailFullModel.toJSON()._id);
		}, this); // added a new EmailFull
		
		this.threadEmails.on('change', function(emailFullModel){
			console.log('EmailChange');
		}, this); // an email is slightly different now (re-render)
		
		// trigger EmailFull collection retrieving
		this.threadEmails.fetch_by_thread_id({
			ids: [this.options.threadid],
			cachePrefix: this.options.threadid
		});



		// // Set up delayed thread caching mechanism
		// that.EmailsFull = new App.Collections.EmailsFull();
		// that.EmailsFull.on('reset', this.reset_EmailsFull, this); // completely changed collection (triggers add/remove)
		// that.EmailsFull.on('sync', this.sync_EmailsFull, this); // completely changed collection (triggers add/remove)
		// that.EmailsFull.on('add', this.add_EmailsFull, this); // added a new ThreadId
		// that.EmailsFull.on('remove', this.remove_EmailsFull, this); // removed a ThreadId
		// that.EmailsFull.on('change', this.change_EmailsFull, this); // an attribute on one changed
		// that.EmailsFull.fetch_by_thread_id({
		// 	ids: [that.options.threadid],
		// 	cachePrefix: that.options.threadid
		// });




		// // Event bindings
		// // - also bound at the top of initialize
		// App.Events.bind('email_sent',this.email_sent);
		// App.Events.bind('thread_updated',this.refresh_and_render_thread);

		// Mark as recently viewed
		App.Plugins.Minimail.add_to_recently_viewed(this.options.threadid);

	},


	beforeClose: function(){
		// unbind events manually
		var that = this;
		
		App.Events.off('email_sent',this.email_sent);
		App.Events.off('thread_updated',this.refresh_and_render_thread);

		App.Utils.BackButton.debubble(this.backbuttonBind);

	},

	set_scroll_position: function(){
		var that = this;

		// Set last scroll position
		this.last_scroll_position = $(window).scrollTop();
		this.$el.attr('last-scroll-position',this.last_scroll_position);

		clog('.' + this.className);
		clog(this.last_scroll_position);

	},

	go_back: function(ev){
		// Going back to mailbox
		// - highlight the correct row we were on? (v2)

		// Is there some way of referencing the Backbone view instead of using jquery? 

		// Re-show .main_body
		$('.main_body').removeClass('nodisplay');

		// Scroll to correct position
		var scrollTo = 0;
		if($('.main_body').attr('last-scroll-position')){
			scrollTo = $('.main_body').attr('last-scroll-position');
		}
		$('.threads_holder').scrollTop(scrollTo);

		// Close myself
		this.close();

		return false;
	},


	click_delay: function(ev){
		// Clicked the "delay" button
		var that = this;

		// Bring up the delay modal
		// - not going to work with the current design, gotta redo the delay modal view

		// Display delay_modal Subview
		var subView = new App.Views.DelayModal({
			context: that,
			threadid: that.threadid,
			onComplete: that.after_delay_modal
		});
		$('body').append(subView.$el);
		subView.render();

		return false;


	},

	after_delay_model: function(wait, wait_text){
		// After delaying
		// - emit an event

		alert('after');

		// Trigger local event
		App.Events.trigger('Thread.delay', that.threadid, wait, wait_text);

		return;
	},

	click_done: function(ev){
		// Clicked the "done" (checkmark) button
		var that = this;

		// Mark as Done
		App.Plugins.Minimail.saveAsDone(that.threadid);

		// Trigger local event
		App.Events.trigger('Thread.done', that.threadid);

		// Return to parent element
		// - tell the screen we're returning to that the element has been marked as Done
		// - todo...

		// go back
		return this.go_back(ev);

	},

	click_pin: function(ev){
		// Trying to Pin something in the email

		// Scan out everything they would possibly want to pin
		// - display each as its own item, and can choose many to pin to different boards

		// Pins work like:
		// - 

		// Launch pinboard for this Thread

		alert('Pinning under development');
		return false;

		this.set_scroll_position();

		Backbone.history.loadUrl('pin/' + this.threadid);


	},

	click_leisure: function(ev){
		// Replying
		var that = this;
		var elem = ev.currentTarget;

		// Display reply boxes
		// - doesn't do Drafts at all yet

		this.set_scroll_position();

		Backbone.history.loadUrl('leisure_create/' + this.threadid);


		return false;
	},

	reply: function(ev){
		// Replying
		var that = this;
		var elem = ev.currentTarget;

		// Display reply boxes
		// - doesn't do Drafts at all yet

		this.set_scroll_position();

		// Load Reply subview
		// Backbone.history.loadUrl('reply/' + this.threadid);

		// Hide myself
		that.$el.addClass('nodisplay');

		// Build the subview
		that.subViewReply = new App.Views.CommonReply({
			threadid: this.threadid
		});
		// Add to window and render
		$('body').append(that.subViewReply.$el);
		that.subViewReply.render();

		// Listen for events

		// Cancel event
		that.subViewReply.ev.on('cancel',function(){
			// Close subview
			
			that.subViewReply.close();

			// Display thread
			that.$el.removeClass('nodisplay');

			// Scroll to correct position
			var scrollTo = 0;
			if($('body > .common_thread_view').attr('last-scroll-position')){
				scrollTo = $('body > .common_thread_view').attr('last-scroll-position');
			}
			$(window).scrollTop(scrollTo);

		});

		// Send event
		that.subViewReply.ev.on('sent',function(){
			// Close subview
			
			that.subViewReply.close();

			// Display thread
			that.$el.removeClass('nodisplay');

			// Scroll to correct position
			var scrollTo = 0;
			if($('body > .common_thread_view').attr('last-scroll-position')){
				scrollTo = $('body > .common_thread_view').attr('last-scroll-position');
			}
			$(window).scrollTop(scrollTo);

		});

		return false;
	},


	forward: function(ev){
		// Forwarding
		// - disabled

		alert('forwarding disabled');
		return false;

	},


	email_sent: function(options){
		// An email was sent
		// - add a "Your email will appear here soon" message

		var that = this;

		this.$('.email_sent_alert').removeClass('nodisplay');


	},


	email_folding: function (ev){
		// Display any hidden emails (previous parts of the conversation)

		var elem = ev.currentTarget;

		var content_holder = $(elem).parents('.email_body');
		//var count = $(content_holder).find('.ParsedDataContent').length;

		// Toggle
		if($(content_holder).hasClass('showAllParsedData')){
			$(content_holder).removeClass('showAllParsedData')
			
			$(content_holder).find('.ParsedDataContent:not([data-level="0"])').hide();

			$(elem).text('...');
		} else {
			$(content_holder).addClass('showAllParsedData')

			$(content_holder).find('.ParsedDataContent:not([data-level="0"])').show();

			$(elem).text('Hide');
		}

	},

	edit_email: function(ev){
		// Edit an email
		var that = this;
		var elem = ev.currentTarget;

		// Email._id
		var id = $(elem).parents('.email').attr('data-id');

		// Set scroll position
		this.set_scroll_position();

		// Launch route
		Backbone.history.loadUrl('edit_email/' + id);

		return false;
	},

	render_thread: function(){
		var that = this;

		this._rendered = true;
		this.$el.removeClass('is-loading');

		console.log('rendering Thread');

		// Template
		var template = App.Utils.template('t_common_thread_view');

		// build the data
		console.log(this.threadEmails.toJSON());
		var data = {
			Thread: that.threadFull.toJSON(),
			Email: that.threadEmails.toJSON()
		};

		// // Sort Email (already sorted?)
		// data.Email = App.Utils.sortBy({
		// 	arr: data.Email,
		// 	path: 'common.date_sec',
		// 	direction: 'asc',
		// 	type: 'num'

		// });

		// Write HTML
		this.$el.html(template(data));

		// Run MathJax code
		// MathJax.Hub.Queue(["Typeset",MathJax.Hub,"threadContainer"]);

		// Parse out links we want to embed
		// - gists: <script src="https://gist.github.com/nicholasareed/5177795.js"></script>
		// - youtube
		_.each(data.Email, function(email, i){
			console.log(1);
			console.log(email);
			try {
				// Iterate over links
				// - embed below
				_.each(email.app.AppPkgDevMinimail.links, function(link, i){
					// GitHub gists
					console.log(link);
					if(link.indexOf("https://gist.github.com/") != -1){
						// Gist is in here
						// - add template
						// console.log('found github gist');
						// var tmp_template = App.Utils.template('t_embed_github_gist');

						// var script = document.createElement('script');
						// script.type = 'text/javascript';
						// // script.async = true;
						// // script.onload = function(){
						// // 	// remote script has loaded
						// // };
						// script.src = link + '.js';
						// that.$('.email[data-id="'+email._id+'"] .email_body').append(script);

						// Get gist_id
						// alert('gist');
						var tmp_link = link.split('/');
						// console.info(tmp_link);
						var gist_id = tmp_link[4];

						// var iframe = document.createElement('iframe');
						// iframe.src = 'http://urlspoiler.heroku.com/gists?id=' + gist_id;
						// iframe.width = "300px";
						// iframe.height = "200px";
						// iframe.setAttribute('style', "border:none;");
						// that.$('.email[data-id="'+email._id+'"] .email_body').append( iframe );

						$.get('https://api.github.com/gists/' + gist_id, function(data){
							// $('body').append($(data));
							// alert('back');
							// console.log('should be rendering');
							// console.log(data);
							// var j = JSON.parse(data);
							var j = data;
							// console.log(data);
							// console.log(JSON.stringify(j.files));
							// console.log(j.files);

							// console.log('files');
							_.each(j.files, function(elem, i){
								// console.log('file');
								// console.log(elem.content);
								that.$('.email[data-id="'+email._id+'"] .email_body').append( '<pre><strong>'+elem.filename+'</strong><br /><br />' + App.Utils.nl2br(elem.content) + '</pre>');
							});
							// that.$('.email[data-id="'+email._id+'"] .email_body').append($(data));
						});
						
						console.log(email._id);
						// that.$('.email[data-id="'+email._id+'"] .email_body').remove();
						// that.$('.email[data-id="'+email._id+'"] .email_body').after(tmp_template(link));
					}
				});
			} catch(e){
				console.warn('error');
				console.error(e);
			}
		});


		// Resize body_container
		this.resize_fluid_page_elements();
		this.resize_scroller();

		return this;
		
	},

	render: function() {
		var that = this;

		// Render structure if not already rendered Thread and Emails
		if(!this._rendered){
			// Render loading

			// Template
			var template = App.Utils.template('t_common_thread_view_loading');

			// Write HTML
			this.$el.html(template());

		}

		// Bind to backbutton
		this.backbuttonBind = App.Utils.BackButton.newEnforcer(this.go_back);

		return this;

	}

});


App.Views.CommonEditEmail = Backbone.View.extend({
	
	className: 'common_edit_email',

	events: {
		'click button[data-action="cancel"]' : 'cancel',
		'click button[data-action="save"]' : 'save'
	},

	initialize: function(options) {
		_.bindAll(this, 'render');
		var that = this;
		// this.el = this.options.el;

		// Render the information we have on this Thread
		this.emailid = this.options.emailid

	},

	cancel: function(ev){
		// Going back to mailbox
		// - highlight the correct row we were on? (v2)

		// Is there some way of referencing the Backbone view instead of using jquery? 

		// Re-show .main_body
		$('body > .common_thread_view').removeClass('nodisplay');

		// Scroll to correct position
		var scrollTo = 0;
		if($('body > .common_thread_view').attr('last-scroll-position')){
			scrollTo = $('body > .common_thread_view').attr('last-scroll-position');
		}
		$(window).scrollTop(scrollTo);
		
		// Close myself
		this.close();

		return false;
	},

	save: function(ev){
		// Save the updated Email
		var that = this;
		var elem = ev.currentTarget;

		// Save
		var id = this.emailid;
		var textbody = this.$('#textbody').val();

		// Update local
		// - AppPkgDevMinimail is probably not created yet
		if(App.Data.Store.Email[this.emailid].app.AppPkgDevMinimail == undefined){
			App.Data.Store.Email[this.emailid].app.AppPkgDevMinimail = {};
		}
		App.Data.Store.Email[this.emailid].app.AppPkgDevMinimail.textbody_edited = textbody

		// Update remote
		Api.update({
			data: {
				model: 'Email',
				id: id,
				paths: {
					"$set" : {
						"app.AppPkgDevMinimail.textbody_edited" : textbody
					}
				}
			},
			success: function(response){
				response = JSON.parse(response);
			}
		});

		// Emit event
		App.Events.trigger("thread_updated", true);

		// Close view and return
		this.cancel();

		// Should be updating the previous thread too

		return false;

	},

	render_email: function(){
		
		// Render the loading screen
		var that = this;

		// Template
		var template = App.Utils.template('t_common_edit_email');

		// Get the body
		// - either an edited one, or the original
		var Email = App.Data.Store.Email[this.emailid];
		var textbody = '';
		try {
			if(Email.app.AppPkgDevMinimail.textbody_edited != undefined){
				textbody = Email.app.AppPkgDevMinimail.textbody_edited;
			} else {
				// Strip html characters?
				// - already done?
				textbody = Email.original.TextBody;
			}
		} catch (err){
			textbody = Email.original.TextBody;
		}
		var data = {
			textbody: textbody
		};

		// Write HTML
		this.$el.html(template(data));

		// Scroll to top
		$(window).scrollTop(0);

		// Focus and bring up keyboard
		this.$('#textbody').focus();

		return this;
		
	},

	render: function() {
		var that = this;

		var email_data = App.Data.Store.Email[this.emailid];
		if(email_data == undefined){
			// Thread not set at all
			alert('email not set at all');

			// Shouldn't not be set at all

			return false;
		} else {
			// Render the email data we have
			that.render_email();

		}

		return this;

	}

});


App.Views.LeisureCreate = Backbone.View.extend({
	// Create a new AppMinimailLeisureFilter

	className: 'common_leisure_create_view',

	events: {

		// 'click .btn[data-action="thread"]' : 'view_thread',
		// 'click .btn[data-action="back"]' : 'view_reply',
		'click .btn[data-action="cancel"]' : 'cancel',
		'click .btn[data-action="create"]' : 'create',

		'click .filter_option' : 'filter_option'

		// 'click .add_attachment' : 'add_attachment'

	},

	disable_buttons: false,

	initialize: function(options) {
		_.bindAll(this, 'render');
		var that = this;
		// this.el = this.options.el;

		// Get any local information we have
		// After getting local info, and if we have enough, show the thing
		// Get remote info, merge with Local when it arrives

		// Render the information we have on this Thread
		this.threadid = this.options.threadid

		// Get the data that we do have for the thing
		// - re-render after we get the whole thing! 
		// App.Utils.Storage.

		// Get the data difference from what we have
		// - diff and patch
		// - already know the fields we would have requested (that doesn't change at all?)


		// // Render the base view
		// var thread_cached = false;
		// if(thread_cached){
		// 	// Thread is in memory
		// 	// - display base view including Thread
		// 	// - todo...
		// } else {
		// 	// No Thread in memory

		// 	// Display base outline
		// 	// Fetch Thread and Emails for thread

		// 	App.Plugins.Minimail.getThreadAndEmails(this.options.threadid)
		// 		.then(function(returnThread){
		// 			that.render_content(returnThread);
		// 		})
		// 		.fail(function(err){
		// 			clog('Failed getThreadAndEmails');
		// 			clog(err);
		// 		});


		// }

	},

	filter_option: function(ev){
		var elem = ev.currentTarget;

		$(elem).addClass('active');
		this.$('.filter_option:not(.active)').remove();

		this.$('.filter_create_name').removeClass('nodisplay');

	},

	cancel: function(ev){
		// Going back to mailbox
		// - highlight the correct row we were on? (v2)

		// Is there some way of referencing the Backbone view instead of using jquery? 

		// Re-show .main_body
		$('body > .common_thread_view').removeClass('nodisplay');

		// Scroll to correct position
		var scrollTo = 0;
		if($('body > .common_thread_view').attr('last-scroll-position')){
			scrollTo = $('body > .common_thread_view').attr('last-scroll-position');
		}
		$(window).scrollTop(scrollTo);

		// this.after_sent();
		
		// Close myself
		this.close();

		return false;
	},

	create: function(ev){
		// Create the filter
		var that = this;

		// Get form data
		var From 	= $.trim(that.$('#from').val()),
			To 		= $.trim(that.$('#to').val()),
			Subject = $.trim(that.$('#subject').val()),
			Name 	= $.trim(that.$('#name').val());

		// Validate form data

		// - must have chosen a filter_option
		if(that.$('.filter_option.active').length < 1){
			alert('Choose your filter criteria!');
			return;
		}

		// get the input
		var $input = that.$('.filter_option.active input');

		// Get criteria
		var regex_key = '',
			regex_value = '';
		switch($input.attr('id')){
			case 'from':
				regex_key = "original.headers.From";
				break;

			case 'to':
				regex_key = "original.headers.To";
				break;

			case 'subject':
				regex_key = "original.headers.Subject";
				break;

			default:
				//shit
				alert('failure');
				return;
				break;
		}

		// Regex value
		// - prevent weird characters?
		// - tell them it is a regex?
		regex_value = $input.val();
		// regex_value = regex_value.replace(/[#-}]/g, '\\$&'); // escape regex characters from search string: http://stackoverflow.com/questions/6300183/sanitize-string-of-regex-characters-before-regexp-build

		// Empty regex_value?
		if(regex_value.length < 1){
			alert('Enter some criteria for your filter!');
			return;
		}

		// Get name of new filter
		var Name = $.trim(that.$('#name').val());

		// duplicate?
		// - don't care if it is?

		// Empty name?
		if(Name.length < 1){
			alert('Enter a name for this filter!');
			return;
		}

		clog('Filter Data');
		console.log(
			{
				"name": Name,
					"filters": [{
						"type": "keyregex1",
						"key": regex_key,
						"regex": "("+regex_value+")",
						"modifiers": "ig"
					}]
			});

		// return false;

		// Save new filter!

		// Make API request
		Api.write({
			data: {
				model: 'AppMinimailLeisureFilter',
				event: 'AppMinimailLeisureFilter.new',
				obj: {
					"name": Name,
						"filters": [{
							"type": "keyregex1",
							"key": regex_key,
							"regex": "("+regex_value+")",
							"modifiers": "ig"
						}]
				}
			},
			success: function(response){
				response = JSON.parse(response);

				if(response.code != 200){
					alert('Failed creating leisure filter');
					return;
				}

				// If created successfully, update this Thread to the Filter
				var filter_id = response.data._id;

				Api.update({
					data: {
						model: 'Thread',
						id: that.threadid,
						paths: {
							"$push" : {
								"app.AppPkgDevMinimail.leisure_filters" : {
									"_id" : filter_id,
									"name" : Name
								}
							}
						}
					},
					success: function(response){
						// Successfully updated thread
						response = JSON.parse(response);

						if(response.code != 200){
							alert('Failed updating Thread with leisure id');
							return;
						}
					}
				});

			}
		});

		// Move to "waiting for success" screen
		// - just "assume" it is going to work?

		// Save as Done
		App.Plugins.Minimail.saveAsDone(that.threadid);

		// Remove the view and go back
		App.Events.trigger('thread_done',that.threadid);

		// close out this view?
		this.cancel();

		// Trigger an event that a Thread has been marked as done
		// - probably removes it?
		// - backbone does this, if I use it correctly (whole fucking point)


	},

	render: function() {
		var that = this;

		// Template
		var template = App.Utils.template('t_common_leisure_create');

		// Get data
		// - must have Thread data already?
		// - wait until we do (probably already fetching it?)


		var Thread = App.Data.Store.Thread[this.threadid];
		if(Thread == undefined){
			// Thread not set at all
			alert('Thread not currently set');
			this.cancel();
			return this;
		}

		// Get the first email in the Thread
		// - only expecting to filter based on the first email
		//		- makes sense?
		var emails = _.filter(App.Data.Store.Email,function(Email){
			if(Email.attributes.thread_id == Thread._id){
				return true;
			}
		});

		if(emails.length < 1){
			// No email
			alert('Unable to load Email');
			this.cancel();
			return this;
		}

		// Sort to find the first Email
		emails = App.Utils.sortBy({
			arr: emails,
			path: 'common.date_sec',
			direction: 'asc',
			type: 'num'
		});
		
		// Get first email
		var Email = emails[0];

		// Get From
		var From = '';
		try {
			From = Email.original.headers.From_Parsed[0][1];
		} catch(err){
			
		}

		From = From.toLowerCase();

		// Get To
		var To = '';
		try {
			To = Email.original.headers.To_Parsed[0][1];
		} catch(err){
			
		}

		From = From.toLowerCase();

		// Words
		var Words = [];
		try {
			Words = Email.original.headers.Subject.split(' '); // split on spaces
		} catch(err){

		}

		var data = {
			normal: {
				from: From, // Only default that gets set
				to: To,
				subject: '', // give a list of possible words to use? (break by spaces, simple)
				words: Words,
				name: ''
			}
		};

		// Write HTML
		this.$el.html(template(data));

		// Resize window
		this.resize_fluid_page_elements();
		this.resize_scroller();

		return this;

	}

});


App.Views.CommonPin = Backbone.View.extend({
	
	className: 'common_thread_pin',

	events: {

	},

	initialize: function(options) {
		_.bindAll(this, 'render');
		var that = this;
		// this.el = this.options.el;

		// Render the information we have on this Thread
		this.threadid = this.options.threadid

	},

	cancel: function(ev){
		// Going back to mailbox
		// - highlight the correct row we were on? (v2)

		// Is there some way of referencing the Backbone view instead of using jquery? 

		// Re-show .main_body
		$('body > .common_thread_view').removeClass('nodisplay');

		// Scroll to correct position
		var scrollTo = 0;
		if($('body > .common_thread_view').attr('last-scroll-position')){
			scrollTo = $('body > .common_thread_view').attr('last-scroll-position');
		}
		$(window).scrollTop(scrollTo);

		// this.after_sent();
		
		// Close myself
		this.close();

		return false;
	},

	render_thread: function(){
		
		// Render the loading screen
		var that = this;

		// Template
		var template = App.Utils.template('t_common_pin');

		var Thread = App.Data.Store.Thread[this.threadid];
		var Emails = _.filter(App.Data.Store.Email,function(email){
				if(email.attributes.thread_id == that.threadid) return true;
			});

		// Optimize View for:
		// - few pinnable options, but always at least 2 (thread, sender, or other person)
		// - speed in pinning one Item to one Topic
		// - finding the thing I'm looking for later

		// Pins work alongside Labels
		// - Labels are a quick way to save the whole Thread/Email (easiest thing to do)

		// What do you want to highlight?
		// - some text in the email
		// - whole email
		// - an attachment
		// - the sender or another person

		// Pin means Easier to Find Later. Surfacing the content enough. 
		// - Highlighting and labeling something makes it easier to find later

		// Auto-pin some things? (no, keep it manual-only at first, don't do anything unexpected)
		// - Phone numbers
		// - Shipping tracking number
		// - Attachments (nah, just got lost in the clutter)

		// Figure out possible pin options
		// - what is already pinned? 

		// Have we scanned all the Emails already?
		// - scan each email, and update them accordingly
		// - not updating the server with these values?
		_.each(Emails,function(email,index,list){
			// Already scanned?
			if(email.app.AppPkgDevMinimail.pin_scanned == true){
				clog('=Not scanning email');
				return;
			}
			clog('Scanning email for pinnable material');

			// Not scanned, run the scan over this email
			var scan_results = App.Utils.get_useful_info_from_email(email);

			// Have a list of "useful" things
			// - list is a complex object that has metadata about the pinned thing
			// - thread_id
			// - text
			// - image

			// Of the "possible" things to pin, what are we actually pinning?

			// Create 
			Email.app.AppPkgDevMinimail.pinnable = [
				{
					type: 'text', // text (phone, addresses, links, etc.), attachment, thread, 
					data: {
						// Some cursory data about the Thread
						// - 
					}

				},
				{
					type: 'attachment', // text (phone, addresses, etc.), attachment, thread, 
					data: {
						// all the attachment details?
					}

				}

			];

			// Only 1 collection for Pins
			// - AppPkgDevMinimailPins

			// Mark as scanned
			App.Data.Store.Email[email._id].pin_scanned = true;

		});

		// Get things we can Pin
		var pinnable = App.Plugins.Minimail.getItemsToPinFromThread(this.threadid);

		// What have we already Pinned from this Thread? 
		var already_pinned = App.Plugins.Minimail.alreadyPinnedFromThread(this.threadid);

		// Merge these together (removing duplicates?
		// - need to scan the Thread and see if any of the Emails haven't actually been scanned yet
		// - emails won't be changing, so it is ok if they get scanned only 1 time



		// Figure out who I'm replying to
		// - inlcude everybody in the email that isn't myself
		// - by default, because it is easier to remove than to add people
		var tmp_participants = _.map(data.Email, function(email){
			// Get the From and Reply-To addresses
			var get_from = ['To','From','Reply-To'];
			var addresses = [];
			_.each(get_from,function(address){
				if(email.original.headers[address + '_Parsed'] != undefined){
					_.each(email.original.headers[address + '_Parsed'],function(parsed_email){
						// My email?
						var ok = true;

						// Sent from myself
						// - disclude? (only if no others?)
						if($.inArray(parsed_email[1], App.Data.UserEmailAccounts_Quick) != -1){
							return false;
						}

						// Add address to list
						addresses.push(parsed_email[1]);

					});
				}
			});
			return addresses;
		});
		
		var tmp_participants2 = [];
		_.each(tmp_participants,function(p1){
			_.each(p1,function(p2){
				tmp_participants2.push(p2);
			});
		});

		// Unique
		tmp_participants2 = _.uniq(tmp_participants2);

		// Filter to valid emails
		tmp_participants2 = _.filter(tmp_participants2,function(p){
			// valid email?
			if(App.Utils.Validate.email(p)){
				return true;
			}
			return false;
		});

		data.Participants = tmp_participants2;


		// Sort Email
		data.Email = App.Utils.sortBy({
			arr: data.Email,
			path: 'common.date_sec',
			direction: 'asc',
			type: 'num'

		});

		// Set for this view object
		this.thread_data = data;


		// Write HTML
		this.$el.html(template(data));

		// Focus on textarea
		// this.$('.textarea').focus();

		// Scroll to top
		$(window).scrollTop(0);

		return this;
		
	},

	render: function() {
		var that = this;

		var thread_data = App.Data.Store.Thread[this.threadid];
		if(data == undefined){
			// Thread not set at all
			alert('thread not set at all');

			// Shouldn't not be set at all
			// - show a total loading screen (loading Thread and Emails)
			// - todo...


			return false;
		} else {
			// Render the thread data we have
			that.render_thread();

		}

		return this;

	}

});


App.Views.CommonReply = Backbone.View.extend({
	
	className: 'common_thread_reply',

	events: {

		'click .btn[data-action="thread"]' : 'view_thread',
		'click .btn[data-action="back"]' : 'view_reply',
		'click .btn[data-action="cancel"]' : 'cancel',
		'click .btn[data-action="send"]' : 'send',

		'click .btn[data-action="contacts"]' : 'contact',

		'click .remove_address' : 'remove_address',

		'click .add_attachment' : 'add_attachment',
		'click .file_attachment' : 'remove_attachment',
		'click .add_photo' : 'add_photo'

	},

	ev: _.extend({}, Backbone.Events),

	disable_buttons: false,

	initialize: function(options) {
		_.bindAll(this, 'render');
		_.bindAll(this, 'beforeClose');
		_.bindAll(this, 'cancel');
		var that = this;
		// this.el = this.options.el;

		// Get any local information we have
		// After getting local info, and if we have enough, show the thing
		// Get remote info, merge with Local when it arrives

		// Render the information we have on this Thread
		this.threadid = this.options.threadid

		// Get the data that we do have for the thing
		// - re-render after we get the whole thing! 
		// App.Utils.Storage.

		// Get the data difference from what we have
		// - diff and patch
		// - already know the fields we would have requested (that doesn't change at all?)


		// // Render the base view
		// var thread_cached = false;
		// if(thread_cached){
		// 	// Thread is in memory
		// 	// - display base view including Thread
		// 	// - todo...
		// } else {
		// 	// No Thread in memory

		// 	// Display base outline
		// 	// Fetch Thread and Emails for thread

		// 	App.Plugins.Minimail.getThreadAndEmails(this.options.threadid)
		// 		.then(function(returnThread){
		// 			that.render_content(returnThread);
		// 		})
		// 		.fail(function(err){
		// 			clog('Failed getThreadAndEmails');
		// 			clog(err);
		// 		});
		

		// }

	},

	beforeClose: function(){
		var that = this;

		// unbind events
		this.ev.unbind();


		App.Utils.BackButton.debubble(this.backbuttonBind);

		return;
	},


	remove_address: function(ev){
		// remove a person from the sending list

		var that = this;
		var elem = ev.currentTarget;

		$(elem).parents('.participant').remove();

	},


	cancel: function(){
		// Going back to mailbox
		// - highlight the correct row we were on? (v2)
		var that = this;

		// emit a cancel event to the parent
		this.ev.trigger('cancel');

		return false;
	},

	after_sent: function(ev){
		// Going back to mailbox
		// - highlight the correct row we were on? (v2)
		// - todo: show that we are waiting for the email to actually be parsed by Gmail and "caught" by Emailbox
		var that = this;
		// Is there some way of referencing the Backbone view instead of using jquery? 

		// Re-show .main_body
		$('body > .common_thread_view').removeClass('nodisplay');

		// Scroll to correct position
		var scrollTo = 0;
		if($('body > .common_thread_view').attr('last-scroll-position')){
			scrollTo = $('body > .common_thread_view').attr('last-scroll-position');
		}
		$(window).scrollTop(scrollTo);

		// Update Thread
		var tmp_emails = new App.Collections.Emails();
		tmp_emails.fetch_for_thread({
			thread_id: that.threadid
		});

		App.Events.trigger("email_sent", true);

		// Close myself
		this.close();

		return false;
	},

	send: function(ev){
		// Validate sending the email
		// Send the email
		var that = this;

		var elem = ev.currentTarget;

		// Disable buttons
		$(elem).text('Sending...');
		$(elem).attr('disabled','disabled');
		this.disable_buttons = true;

		// Throw into a different view after success?
		

		// In Reply To
		var in_reply = this.thread_data.Email[this.thread_data.Email.length - 1].common['Message-Id'];

		// References (other message-ids)
		var references = _.map(this.thread_data.Email,function(email){
			return email.common['Message-Id'];
		});

		// To
		var to = [];
		this.$('.participant').each(function(index){
			to.push($(this).attr('data-email'));
		});
		to = to.join(',');


		// Send return email
		var eventData = {
			event: 'Email.send.validate',
			delay: 0,
			obj: {
				To: to,
				From: App.Data.UserEmailAccounts.at(0).get('email'),
				Subject: that.thread_data.Email[that.thread_data.Email.length - 1].original.headers.Subject,
				Text: that.$('#textbody').val(),
				headers: {
					"In-Reply-To" : in_reply,
					"References" : references.join(',')
				},
				attachments: []
			}
		};

		// Add attachments
		// - not required
		that.$('.file_attachment').each(function(idx, fileElem){
			eventData.obj.attachments.push({
				_id: $(fileElem).attr('data-file-id'),
				name: $(fileElem).attr('data-file-name')
			});
		});

		// Validate sending
		Api.event({
			data: eventData,
			response: {
				"pkg.native.email" : function(response){
					// Handle response (see if validated to send)
					// clog('Response');
					// clog(response);
					// clog(response.body.code);

					// Update the view code
					if(response.body.code == 200){
						// Ok, validated sending this email
						clog('Valid email to send');
					} else {
						// Failed, had an error

						alert('Sorry, Invalid Email');

						$(elem).text('Send');
						$(elem).attr('disabled',false);
						that.disable_buttons = false;
						return false;
					}

					// Get rate-limit info
					tmp_rate_limit = response.body.data;

					// Over rate limit?
					if(tmp_rate_limit.current + 1 >= tmp_rate_limit.rate_limit){

						alert('Sorry, Over the Rate Limit (25 emails per 6 hours)');

						$(elem).text('Send');
						$(elem).attr('disabled',false);
						that.disable_buttons = false;
						return false;
						
					}

					// All good, SEND Email
					eventData.event = 'Email.send';

					// Log
					clog('sending reply Email');
					clog(eventData);

					Api.event({
						data: eventData,
						response: {
							"pkg.native.email" : function(response){
								
								// Update the view code
								if(response.body.code == 200){
									// Sent successfully

								} else {
									// Failed, had an error sending

									alert('Sorry, we might have failed sending this email');
									
									$(elem).text('Send');
									$(elem).attr('disabled',false);
									that.disable_buttons = false;
									return false;
								}


								// Sent successfully! 

								// Add to Email thread?
								// - no, wait for the Email to be received, and it was be updated

								that.after_sent();

							}
						}
					});



					// if validation ok, then continue to the next one
					// - resolve or call?

				}
			}
		});


		return false;

	},


	view_thread: function(ev){
		// Show the Thread

		var that = this;

		this.$('.common_thread_view').removeClass('nodisplay');
		this.$('.common_thread_reply_content').addClass('nodisplay');

		$(window).scrollTop(0);

		return false;

	},


	view_reply: function(ev){
		// Show the Thread

		var that = this;

		this.$('.common_thread_view').addClass('nodisplay');
		this.$('.common_thread_reply_content').removeClass('nodisplay');

		$(window).scrollTop(0);

		return false;

	},

	contact: function(ev){
		// Choose a contact
		var that = this;
			elem = ev.currentTarget;

		// Validate email

		if(useForge){
			forge.contact.select(function(contact){
				// Got contact
				// - validate Email

				// Gather only emails
				var emails = _.map(contact.emails,function(email){
					return email.value;
				});

				// Valid email?
				emails = _.filter(emails,function(email){
					if(App.Utils.Validate.email(email)){
						return true;
					}
				});

				// Unique?
				emails = _.uniq(emails);
				// emails = emails.concat(emails); // testing multiple emails

				// How many left?
				if(emails.length == 1){
					// Only 1 email
					that.chose_email(emails[0]);

				} else if(emails.length > 1) {
					// Show subview to choose which email to use
					var subView = new App.Views.SelectEmailList({
						chose_email: that.chose_email,
						emails: emails
					});
					$('body > .full_page').addClass('nodisplay');
					$('body').append(subView.$el);
					subView.render();

				} else {
					// No emails found
					alert('No emails found for that contact');
					return false;
				}

			},function(content){
				// Error
				clog('Error getting contact');
			});
		} else if(usePg){

			// Already have contacts data?

			// Change element to "loading contacts"
			$(elem).text('Loading...');

			// Display contacts chooser subview
			window.setTimeout(function(){
				that.subViewContacts = new App.Views.ChooseContact({
					Parent: that,
					multiple: true
				});
				that.$el.addClass('nodisplay');
				$('body').append(that.subViewContacts.$el);
				that.subViewContacts.render();

				// Change text back
				$(elem).text('Contacts');

			},1);



		} else {

			// use sample data
			// $(elem).text('Loading...');

			that.subViewContacts = new App.Views.ChooseContact({
				Parent: that,
				multiple: true,
				contacts: App.Data.tmp
			});
			that.$el.addClass('nodisplay');
			$('body').append(that.subViewContacts.$el);
			that.subViewContacts.render();



			// this.contact_write();


		}

		return false;

	},

	contact_write: function(ev){
		// Enter an email directly
		var that = this;

		var email = prompt('Write Email Address');
		if(!email){
			return false;
		}

		if(App.Utils.Validate.email(email)){

			// var subView = new App.Views.SelectEmailList({
			// 	chose_email: that.chose_email,
			// 	emails: [email,email]
			// });
			// $('body > div').addClass('nodisplay');
			// $('body').append(subView.$el);
			// subView.render();

			// Add using a template
			that.chose_email(email);

		} else {
			alert('Invalid Email Address');
		}

	},

	chose_email: function(email){
		// Add the emailt to the list
		var that = this;

		// Add using a template
		var template = App.Utils.template('t_compose_recipient');

		// If exists, display it
		if(email){
			that.$('.addresses').append(template(email));
		}

	},


	email_folding: function (ev){
		// Display any hidden emails (previous parts of the conversation)

		var elem = ev.currentTarget;

		var content_holder = $(elem).parents('.email_body');
		//var count = $(content_holder).find('.ParsedDataContent').length;

		// Toggle
		if($(content_holder).hasClass('showAllParsedData')){
			$(content_holder).removeClass('showAllParsedData')
			
			$(content_holder).find('.ParsedDataContent:not([data-level="0"])').hide();

			$(elem).text('...');
		} else {
			$(content_holder).addClass('showAllParsedData')

			$(content_holder).find('.ParsedDataContent:not([data-level="0"])').show();

			$(elem).text('Hide');
		}

	},

	add_attachment: function(){
		// Add an attachment
		
		// Launch Filepicker.io (new window, uses ChildBrowser)
		filepicker.getFile('*/*', {
				// services: ['DROPBOX','BOX','FACEBOOK','GMAIL'], // broken, causes Filepicker error
				openTo: 'DROPBOX'
			},
			function(fpurl){ // on return
				// Got an fpurl (or multiple of them?)
				// alert('got fpurl');

				// Get Metadata
				$.ajax({
					url: fpurl + '/metadata',
					cache: false,
					json: true,
					success: function(fpinfo){
						// Got metadata for the file
						// - not handling failures well
						// console.log(fpinfo); // [object Object]

						// Write File to Emailbox
						Api.write_file({
							data: {
								url: fpurl,
								name: fpinfo.filename
							},
							success: function(response){
								response = JSON.parse(response);

								if(response.code != 200){
									// Failed writing File
									alert('Failed writing File');
									return false;
								}

								// Uploaded to Emailbox OK

								// Compile Template data
								var templateData = {
									url: response.data.access.url,
									name: response.data.name,
									_id: response.data._id
								};
								console.log('tData');
								console.log(JSON.stringify(templateData));

								// Write template
								var template = App.Utils.template('t_common_file_attachment');

								// Append
								$('.file_attachments').append(
									template(templateData)
								);

							}
						});

					}
				}); // promise?
			}
		);

		return false;
	},

	remove_attachment: function(ev){
		// Remove attachment
		// - should also remove from Filepicker?
		//   - gets auto-removed after 4 hours
		var that = this,
			elem = ev.currentTarget;

		// Remove
		$(elem).remove();

		// done	
		return false;
	},


	add_photo: function(ev){
		// Launch the photo taker
		// - uses either the camera, gallery, or the webcam
		var that = this;
		var elem = ev.currentTarget;

		if(useForge){
			forge.file.getImage({
				// params here
				width: 1000
			},function(file){
				// Success
				clog(file);
				clog(JSON.stringify(file));

				// Show a temporary image in the attachments thing
				forge.file.URL(file,function(url){
					// write template
					var template = App.Utils.template('t_common_photo_preview_image');

					// Append
					$('.compose_attachments').append(template({url: url}));

					clog(url);
					

				},function(content){

				});

			},function(content){
				// Error
				// - might have just canceling getting an image? 
				clog('Error');

			});
		}

		if(usePg){
			
			// Launch Camera
			// - also allow photo album? Anything else by default? 
			navigator.camera.getPicture(function(imageURI){

				// Todo: Save file to filepicker
				// - save it where? To dropbox? File upload API? 

				// Write template
				var template = App.Utils.template('t_common_photo_preview_image');

				// Append
				$('.compose_attachments').append(template({url: 'missing.png'}));

				// clog(imageURI);

			}, function(err){
				console.log('Error getting image');
				console.log(err);
			}, { 
				quality: 20, 
				destinationType: Camera.DestinationType.FILE_URI,
				correctOrientation: true,
				allowEdit: true, 
				encodingType: Camera.EncodingType.PNG,
				targetWidth: 1000,
				targetHeight: 1000
			});

		}

	},


	render_init: function(){

	},

	render_thread: function(){
		
		clog('rendering Thread');

		// Render the loading screen
		var that = this;

		// Template
		var template = App.Utils.template('t_common_thread_reply');

		// build the data
		var data = {
			Thread: App.Data.Store.Thread[this.threadid],
			Email: _.filter( App.Data.Store.Email,function(email){
					if(email.attributes.thread_id == that.threadid) return true;
				})
		};	

		// Figure out who I'm replying to
		// - inlcude everybody in the email that isn't myself
		// - by default, because it is easier to remove than to add people
		var tmp_participants = _.map(data.Email, function(email){
			// Get the From and Reply-To addresses
			var get_from = ['To','From','Reply-To'];
			var addresses = [];
			_.each(get_from,function(address){
				if(email.original.headers[address + '_Parsed'] != undefined){
					_.each(email.original.headers[address + '_Parsed'],function(parsed_email){
						// My email?
						var ok = true;

						// Sent from myself
						// - disclude? (only if no others?)
						if($.inArray(parsed_email[1], App.Data.UserEmailAccounts_Quick) != -1){
							return false;
						}

						// Add address to list
						addresses.push(parsed_email[1]);

					});
				}
			});
			return addresses;
		});
		
		var tmp_participants2 = [];
		_.each(tmp_participants,function(p1){
			_.each(p1,function(p2){
				tmp_participants2.push(p2);
			});
		});

		// Unique
		tmp_participants2 = _.uniq(tmp_participants2);

		// Filter to valid emails
		tmp_participants2 = _.filter(tmp_participants2,function(p){
			// valid email?
			if(App.Utils.Validate.email(p)){
				return true;
			}
			return false;
		});

		data.Participants = tmp_participants2;


		// Sort Email
		data.Email = App.Utils.sortBy({
			arr: data.Email,
			path: 'common.date_sec',
			direction: 'asc',
			type: 'num'

		});

		// Set for this view object
		this.thread_data = data;


		// Write HTML
		this.$el.html(template(data));

		// Focus on textarea
		// this.$('.textarea').focus();

		// Scroll to top
		$(window).scrollTop(0);

		return this;
		
	},

	render: function() {
		var that = this;

		var data = App.Data.Store.Thread[this.threadid];
		if(data == undefined){
			alert('thread data not set, not loading');
			// Thread not set at all
			// - get it and start replying
			//		- should be able to start replying right away, load details in a minute
			
			// Template
			var template = App.Utils.template('t_common_loading');

			// Write HTML
			this.$el.html(template());


			return this;
		} else {
			// Just render the Thread data (we should have it)
			
			var tmp_emails = new App.Collections.Emails();
			tmp_emails.fetch_for_thread({
				thread_id: that.threadid,
				success: function(emails){
					// Anything different from the existing look?
					// - update the View with new data
					
					clog('re-rendering Thread');
					// that.render();

				}
			});

			that.render_thread();

		}

		// Bind to backbutton
		this.backbuttonBind = App.Utils.BackButton.newEnforcer(this.cancel);

		return this;

	}

});


App.Views.CommonCompose = Backbone.View.extend({
	
	className: 'common_compose',

	events: {

		'click .btn[data-action="contact"]' : 'contact',
		'click .btn[data-action="contact_write"]' : 'contact_write',
		'click .btn[data-action="cancel"]' : 'cancel',
		'click .btn[data-action="send"]' : 'send',

		'click .participant' : 'remove_address', // click anywhere on the email to remove it

		'click .add_attachment' : 'add_attachment',
		'click .add_photo' : 'add_photo',

		'click .file_attachment' : 'remove_attachment'

	},

	disable_buttons: false,

	initialize: function(options) {
		_.bindAll(this, 'render');
		_.bindAll(this, 'beforeClose');
		_.bindAll(this, 'cancel');
		_.bindAll(this, 'chose_email');
		_.bindAll(this, 'enable_send_button');

		var that = this;
		// this.el = this.options.el;

	},

	beforeClose: function(){
		// Kill back button grabber
		var that = this;

		App.Utils.BackButton.debubble(this.backbuttonBind);

		return;
	},


	remove_address: function(ev){
		// remove a person from the sending list
		var that = this,
			elem = ev.currentTarget;

		// Confirm removing
		// - probably do away with this step
		//	- maybe have a slight delay before it actually gets rid of it, as a way to *undo* instead of having to confirm
		var c = confirm('Remove address?');
		if(!c){
			return;
		}

		// Remove address
		$(elem).remove();

	},

	contact: function(ev){
		// Choose a contact
		var that = this;
			elem = ev.currentTarget;

		// Validate email

		if(usePg){

			// Already have contacts data?

			// Change element to "loading contacts"
			$(elem).text('Loading...');

			// Display contacts chooser subview
			window.setTimeout(function(){

				if(!App.Data.PermaViews.contacts){
					// Create page for first time
					App.Data.PermaViews.contacts = new App.Views.ChooseContact();
				}

				// that.subViewContacts = new App.Views.ChooseContact({
				// 	Parent: that,
				// 	multiple: true
				// });

				// Set Parent for the View
				App.Data.PermaViews.contacts.Parent = that;

				// Turn on multi-select
				// - on by default?
				App.Data.PermaViews.contacts.multiple = true;

				// Hide compose view
				that.$el.addClass('nodisplay');

				// Tell contacts to render
				// - the DOM element gets populated
				App.Data.PermaViews.contacts.render();

				// Add ChooseContacts view to the HTML
				$('body').append(App.Data.PermaViews.contacts.el);

				// Change text back
				// - after view is already hidden
				$(elem).text('Contacts');

				// Listen for contact events
				// - chose_email
				// - cancel
				// - any others?

				// "cancel" event
				App.Data.PermaViews.contacts.on('cancel',function(){
					
					// Remove View
					App.Data.PermaViews.contacts.remove(); // this removes it from the DOM I believe

					// un-hide this view
					that.$el.removeClass('nodisplay');

					// scroll to top
					$('body').scrollTop(0);

					// Remove listeners
					App.Data.PermaViews.contacts.off();

				}, this);	

				// "chose_email" event
				App.Data.PermaViews.contacts.on('chose_email',function(email){

					console.log('  chose_email');
					// Remove View
					App.Data.PermaViews.contacts.remove(); // this removes it from the DOM I believe

					// un-hide this view
					that.$el.removeClass('nodisplay');

					// Add using a template
					var template = App.Utils.template('t_compose_recipient');

					// If exists, display it
					if(email){
						that.$('.addresses').append(template(email));
					}

					// scroll to top
					$('body').scrollTop(0);

					// Remove listeners
					App.Data.PermaViews.contacts.off();

				}, this);				


			},1);



		} else {

			// use sample data
			// $(elem).text('Loading...');

			that.subViewContacts = new App.Views.ChooseContact({
				Parent: that,
				multiple: true,
				contacts: App.Data.tmp
			});
			that.$el.addClass('nodisplay');
			$('body').append(that.subViewContacts.$el);
			that.subViewContacts.render();



			// this.contact_write();


		}

		return false;

	},

	contact_write: function(ev){
		// Enter an email directly
		var that = this;

		var email = prompt('Write Email Address');
		if(!email){
			return false;
		}

		if(App.Utils.Validate.email(email)){

			// var subView = new App.Views.SelectEmailList({
			// 	chose_email: that.chose_email,
			// 	emails: [email,email]
			// });
			// $('body > div').addClass('nodisplay');
			// $('body').append(subView.$el);
			// subView.render();

			// Add using a template
			that.chose_email(email);

		} else {
			alert('Invalid Email Address');
		}

	},

	chose_email: function(email){
		// Add the emailt to the list
		var that = this;

		// Add using a template
		var template = App.Utils.template('t_compose_recipient');

		// If exists, display it
		if(email){
			that.$('.addresses').append(template(email));
		}

	},

	cancel: function(ev){
		// Going back to mailbox
		// - highlight the correct row we were on? (v2)

		// Is there some way of referencing the Backbone view instead of using jquery? 

		// Re-show .main_body
		$('body > .main_body').removeClass('nodisplay');

		// Scroll to correct position
		var scrollTo = 0;
		if($('body > .main_body').attr('last-scroll-position')){
			scrollTo = $('body > .main_body').attr('last-scroll-position');
		}
		$('.threads_holder').scrollTop(scrollTo);

		// this.after_sent();
		
		// Close myself
		this.close();

		return false;
	},

	after_sent: function(ev){
		// Going back to mailbox
		// - highlight the correct row we were on? (v2)
		// - todo: show that we are waiting for the email to actually be parsed by Gmail and "caught" by Emailbox
		var that = this;
		// Is there some way of referencing the Backbone view instead of using jquery? 

		// Re-show .main_body
		$('body > .main_body').removeClass('nodisplay');

		// Scroll to correct position
		var scrollTo = 0;
		if($('body > .main_body').attr('last-scroll-position')){
			scrollTo = $('body > .main_body').attr('last-scroll-position');
		}
		$('.threads_holder').scrollTop(scrollTo);

		// Update Thread
		// var tmp_emails = new App.Collections.Emails();
		// tmp_emails.fetch_for_thread({
		// 	thread_id: that.threadid
		// });

		App.Events.trigger("email_compose_sent", true);

		// Toast
		App.Utils.toast('Email Sent Successfully');

		// Close myself
		this.close();

		return false;
	},

	enable_send_button: function(){
		var that = this;

		this.$('.btn[data-action="send"]').text('Send');
		this.$('.btn[data-action="send"]').attr('disabled',false);
		that.disable_buttons = false;
		
	},

	send: function(ev){
		// Send the email
		// - Validate sending the email
		var that = this,
			elem = ev.currentTarget;

		// Disable buttons
		$(elem).text('Sending...');
		$(elem).attr('disabled','disabled');
		this.disable_buttons = true;

		// Throw into a different view after success?

		// To
		var to = [];
		this.$('.participant').each(function(index){
			to.push($(this).attr('data-email'));
		});

		// At least one? 
		if(to.length < 1){
			alert('Please include a recipient!');

			// Re-enable send button
			that.enable_send_button();
			return;
		}

		// Rejoin
		to = to.join(',');

		// Validation data
		var eventData = {
			event: 'Email.send.validate',
			delay: 0,
			obj: {
				To: to,
				From: App.Data.UserEmailAccounts.at(0).get('email'),
				Subject: that.$('#subject').val(),
				Text: that.$('#textbody').val(),
				headers: {
					// nothing to add yet
				},
				attachments: []
			}
		};

		// Add attachments
		// - not required
		that.$('.file_attachment').each(function(idx, fileElem){
			eventData.obj.attachments.push({
				_id: $(fileElem).attr('data-file-id'),
				name: $(fileElem).attr('data-file-name')
			});
		});

		// Validate sending
		Api.event({
			data: eventData,
			response: {
				"pkg.native.email" : function(response){
					// Handle response (see if validated to send)
					// clog('Response');
					// clog(response);
					// clog(response.body.code);

					// Update the view code
					if(response.body.code == 200){
						// Ok, validated sending this email

					} else {
						// Failed, had an error

						alert('Sorry, Invalid Email');

						that.enable_send_button();
						return false;
					}

					// Get rate-limit info
					tmp_rate_limit = response.body.data;

					// Over rate limit?
					if(tmp_rate_limit.current + 1 >= tmp_rate_limit.rate_limit){

						alert('Sorry, Over the Rate Limit (25 emails per 6 hours)');

						that.enable_send_button();
						return false;
						
					}

					// All good, SEND Email
					eventData.event = 'Email.send';

					// Add Attachments to Emailbox File API
					// - doing it here, instead of before sending (in case we just want to delete it?)

					// Log
					clog('sending composed Email');
					clog(eventData);

					Api.event({
						data: eventData,
						response: {
							"pkg.native.email" : function(response){
								
								// Update the view code
								if(response.body.code == 200){
									// Sent successfully

								} else {
									// Failed, had an error sending

									alert('Sorry, we might have failed sending this email');
									
									that.enable_send_button();
									return false;
								}


								// Sent successfully! 

								// Add to Email thread?
								// - no, wait for the Email to be received, and it was updated

								that.after_sent();

							}
						}
					});



					// if validation ok, then continue to the next one
					// - resolve or call?

				}
			}
		});


		return false;

	},

	add_attachment: function(){

		// filepicker.getFile(function(FPFile){
		// 	clog(FPFile.url);
		// });
	

		// Pretend it is this file:
		// - https://www.filepicker.io/api/file/5qYoopVTsixCJJiqSWSE

		// alert('Attachments broken, substituting Fry');

		// var file = {
		// 	url: 'https://www.filepicker.io/api/file/5qYoopVTsixCJJiqSWSE',
		// 	name: 'fry.png'
		// };

		// setTimeout(function(){
		// 	// Pretend we just loaded the file through Filepicker (currently broken)

		// 	// Add url and little "attachment" icon-file to Files fields

		// 	var url = file.url;

		// 	// Write template
		// 	var template = App.Utils.template('t_common_file_attachment');

		// 	// Append
		// 	$('.file_attachments').append(
		// 		template({
		// 			url: file.url, 
		// 			name: file.name
		// 		})
		// 	);

		// },300);

		// return false;

		// Launch Filepicker.io (new window, uses ChildBrowser)
		filepicker.getFile('*/*', {
				// services: ['DROPBOX','BOX','FACEBOOK','GMAIL'], // broken, causes Filepicker error
				openTo: 'DROPBOX'
			},
			function(fpurl){ // on return
				// Got an fpurl (or multiple of them?)
				// alert('got fpurl');

				// Get Metadata
				$.ajax({
					url: fpurl + '/metadata',
					cache: false,
					json: true,
					success: function(fpinfo){
						// Got metadata for the file
						// - not handling failures well
						// console.log(fpinfo); // [object Object]

						// Write File to Emailbox
						Api.write_file({
							data: {
								url: fpurl,
								name: fpinfo.filename
							},
							success: function(response){
								response = JSON.parse(response);

								if(response.code != 200){
									// Failed writing File
									alert('Failed writing File');
									return false;
								}

								// Uploaded to Emailbox OK

								// Compile Template data
								var templateData = {
									url: response.data.access.url,
									name: response.data.name,
									_id: response.data._id
								};
								console.log('tData');
								console.log(JSON.stringify(templateData));

								// Write template
								var template = App.Utils.template('t_common_file_attachment');

								// Append
								$('.file_attachments').append(
									template(templateData)
								);

							}
						});

					}
				}); // promise?
			}
		);

		return false;
	},


	add_photo: function(ev){
		// Launch the photo taker
		// - uses either the camera, gallery, or the webcam
		var that = this;
		var elem = ev.currentTarget;

		if(useForge){
			forge.file.getImage({
				// params here
				width: 1000
			},function(file){
				// Success
				clog(file);
				clog(JSON.stringify(file));

				// Show a temporary image in the attachments thing
				forge.file.URL(file,function(url){
					// write template
					var template = App.Utils.template('t_common_photo_preview_image');

					// Append
					$('.compose_attachments').append(template({url: url}));

					clog(url);
					

				},function(content){

				});

			},function(content){
				// Error
				// - might have just canceling getting an image? 
				clog('Error');

			});
		}

		if(usePg){
			
			// Launch camera
			navigator.camera.getPicture(function(imageURI){

				// Todo: Save file to filepicker
				// - save it where? To dropbox? File upload API? 

				// Write template
				var template = App.Utils.template('t_common_photo_preview_image');

				// Append
				$('.compose_attachments').append(template({url: 'missing.png'}));

				// clog(imageURI);

			}, function(err){
				console.log('Error getting image');
				console.log(err);
			}, { 
				quality: 20, 
				destinationType: Camera.DestinationType.FILE_URI,
				correctOrientation: true,
				allowEdit: true, 
				encodingType: Camera.EncodingType.PNG,
				targetWidth: 1000,
				targetHeight: 1000
			}); 

			// This does not run until camera returns

		}

	},

	remove_attachment: function(ev){
		// Remove attachment
		// - should also remove from Filepicker?
		//   - gets auto-removed after 4 hours
		var that = this,
			elem = ev.currentTarget;

		// Remove
		$(elem).remove();

		// done	
		return false;
	},


	render_init: function(){

	},

	render: function() {
		var that = this;

		// Template
		var template = App.Utils.template('t_common_compose');

		// Write HTML
		this.$el.html(template());

		// Focus
		this.$('#subject').focus();

		// Bind to backbutton
		this.backbuttonBind = App.Utils.BackButton.newEnforcer(this.cancel);

		return this;

	}

});



App.Views.ChooseContact = Backbone.View.extend({
	
	className: 'view_choose_contacts has-header',

	events: {
		'click .contact' : 'choose_email',
		'click .cancel' : 'cancel'
	},

	initialize: function(options) {
		var that = this;
		_.bindAll(this, 'render');
		_.bindAll(this, 'back');

		// this.el = this.options.el;

		// Get contacts
		// - display whether we are fetching contacts and updating them
		// - should be treated as a Collection of Contact Models

		this._renderedContacts = null;

		if(usePg){

			// Collect from Collection.Contacts

			// If Rendered, continue rendering
			this.contacts = new App.Collections.Contacts();

			this.contacts.on('reset',function(contacts){
				// alert('reset');
				console.log('reset contacts');
			}, this);
			this.contacts.on('sync',function(contacts){
				// Render template with all contacts
				// - ignoring additions/subtractions until next load
				// - not using 'add' or 'remove' at all
				console.log('sync');
				if(contacts.length < 1){
					// Nothing to render (probably nothing cached, first grab)
					console.log('no contacts found (in cache?)');
					return;
				}
				console.log('found some contacts');

				// Template
				var template = App.Utils.template('t_choose_contacts');

				// Write HTML
				if(!that._renderedContacts){
					that.__renderedContacts = true;
					that.$el.html(template({
						contacts: contacts.toJSON()
					}));
				} else {
					console.log('already rendered');
				}

			});

			var k = 1;
			this.contacts.on('add', function(contact){
				// console.log('added_contact: ' + k);
				k++;
			}, this);

			this.contacts.on('remove', function(contact){
				// console.log('removed_contact');
				// k--;
			}, this);

			this.contacts.on('all', function(event){
				if(event == 'add' || event == 'remove'){
					return;
				}
				console.log(event);
			}, this);

			// Trigger data
			this.contacts.fetch();

		} else {
			// Browser

			App.Data.Store.Contacts = App.Data.tmp_contacts;
			var contacts_parsed = that.parse_and_sort(App.Data.Store.Contacts);
			App.Data.Store.ContactsParsed = contacts_parsed;

			// Re-render
			alert('rerender');
			that.render();

		}

	},

	beforeClose: function(){
		// Kill back button grabber
		var that = this;

		// App.Utils.BackButton.debubble(this.backbuttonBind);

		return;
	},

	close: function(){
		// Don't actually close
		// - overwriting Backbone.View.prototype.close (at top)
		var that = this;

		// De-bubble BackButton
		App.Utils.BackButton.debubble(this.backbuttonBind);

		return this;

	},

	cancel: function(ev){
		// Cancel and return
		var that = this,
			elem = ev.currentTarget;

		// Trigger cancel
		this.trigger('cancel');

		// Return
		// this.back(null);

		return false;

	},

	choose_email: function(ev){
		// Chose one of the emails for the person
		var that = this,
			elem = ev.currentTarget;

		// Get email
		var email = $(elem).attr('data-email');

		// Trigger that we got an email
		this.trigger('chose_email',email);


		// // Return
		// this.back(email);

		// return false;
		return;
	},

	back: function(email){
		var that = this;

		this.trigger('cancel');

		return;

		// this.cancel();

		// alert('never back!');
		// // trying to exit
		// // - trigger "want to leave"
		// // - expect some other view to handle this mofucker
		// this.trigger('want_to_leave', email);

		// // // Add email to the parent page
		// // this.options.Parent.chose_email(email);

		// // // Show the parent
		// // // - should be using a window manager
		// // that.options.Parent.$el.removeClass('nodisplay');
		// // // $('body > .common_compose').removeClass('nodisplay');

		// // // Close this view
		// this.close();

	},

	render: function() {
		var that = this;

		// Already rendered once?
		if(this._rendered){
			// Already rendered, but asking to be shown?

			// Re-bind events
			this.delegateEvents()

			// Re-bind events for subViews (not necessary for ChooseContacts yet)
			// _(that._subViews.undecided).each(function(v) {
			// 	v.trigger('rebind');
			// });

			// Back button
			this.backbuttonBind = App.Utils.BackButton.newEnforcer(this.back);

			return this;
		}

		this._rendered = true;

		// Template (loading)
		var template = App.Utils.template('t_common_loading');

		// Write HTML
		this.$el.html(template());

		// Back button
		this.backbuttonBind = App.Utils.BackButton.newEnforcer(this.back);

		// // Data
		// // var data = this.options.accounts.UserGmailAccounts;

		// // Should start the updater for accounts
		// // - have a separate view for Accounts?

		// // console.log(JSON.stringify(this.options.contacts[0]));
		// // Api.event({
		// // 	data: {
		// // 		event: 'Render.test',
		// // 		obj: this.options.contacts.splice(0,10)
		// // 	}
		// // });

		// // Sort/organize contacts

		// // Get into list of contacts and emails
		// // - displaying 1 contact and 1 email per line

		// // Empty App.Data.Store.Contacts?
		// // - never got them before
		// if(App.Data.Store.ContactsParsed.length < 1){

		// 	// Don't continue displaying
		// 	return

		// }

		// // Template
		// var template = App.Utils.template('t_choose_contacts');

		// // Write HTML
		// this.$el.html(template({
		// 	contacts: App.Data.Store.ContactsParsed
		// }));

		return this;
	}
});


App.Views.ThreadOptions = Backbone.View.extend({
	
	className: 'thread_preview_options_holder',

	events: {
		'click .done' : 'click_done',
		'click .delay' : 'click_delay',
		'click .reply' : 'click_reply',
		'click .note' : 'click_note'
	},

	initialize: function(options) {
		var that = this;
		_.bindAll(this, 'render');
		_.bindAll(this, 'mass_action');
		_.bindAll(this, 'after_delay_modal');

		// Expecting to be initiated with:
		/*
		{
			Parent: // App.Views.All
			ThreadElem: // .thread
			threadid:  // string
			type: ['delayed','undecided']
		}
		*/

		var allowed_types = ['delayed','undecided']; // "delayed" might be wrong!!!
		if(!this.options.type){
			alert('Expecting type in options');
		}


	},


	click_done: function(ev){
		// Mark older messages as done

		var that = this,
			elem = ev.currentTarget;

		// Get this message's id
		// - mark everything older than this email that matches the conditions presented earlier
		// - must already be in the undecided, etc.
		var thread_id = this.options.threadid;

		var conditions = {},
			time_sec = 0; // either last message datetime, or wait_until

		// Get everything "above" this (what you are looking at)
		// - no longer affects "invisible" elements

		// Get all elements above this one
		// - and including this one
		// - but not ones that have already been processed

		var incl_thread_ids = [];
		$('.thread[data-thread-type="'+ this.options.type +'"]').reverse().each(function(i, threadElem){
			if($(threadElem).hasClass('tripped')){
				// Already tripped, don't use this one
				return;
			}

			// Wait for this element to get triggered
			if(incl_thread_ids.length > 0){
				// Already found this element
				incl_thread_ids.push($(threadElem).attr('data-id'));
			} else if($(threadElem).attr('data-id') == that.options.threadid){
				incl_thread_ids.push($(threadElem).attr('data-id'));
			}
		});

		// Do something to each
		// $.each(incl_thread_ids,function(i, v){
		// 	console.log(v);
		// });

		
		// Run update command
		Api.update({
			data: {
				model: 'Thread',
				conditions: {
					'_id' : {
						'$in' : incl_thread_ids
					}
				},
				multi: true, // edit more than 1? (yes)
				paths: {
					"$set" : {
						"app.AppPkgDevMinimail.done" : 1
					}
				}
			},
			success: function(response){
				// Successfully updated
				response = JSON.parse(response);
				if(response.code != 200){
					// Updating failed somehow
					// - this is bad, it means the action we thought we took, we didn't take
					alert('Update may have failed');
				}
			}
		});

		
		// Fire event to modify move Email/Thread to Archive (it will be brought back later when wait_until is fired)
		_.each(incl_thread_ids, function(tmp_thread_id){
			
			Api.event({
				data: {
					event: 'Thread.action',
					obj: {
						'_id' : tmp_thread_id, // allowed to pass a thread_id here
						'action' : 'archive'
					}
				},
				success: function(response){
					response = JSON.parse(response);

					if(response.code != 200){
						// Failed launching event
						alert('Failed launching Thread.action2');
						dfd.reject(false);
						return;
					}

				}
			});

		});


		// Instead, emit an event that is handled by the server for 
		// - 

			
		that.mass_action('done', this.options.type, incl_thread_ids);

		return;


		// if(this.options.type == 'undecided'){
		// 	// Undecided

		// 	// Build the conditions for the update
		// 	// - same conditions as on App.Collections.UndecidedThreads.undecided_conditions
		// 	conditions = {
		// 		'$or' : [
		// 			{
		// 				'$and' : [
		// 					{
		// 						// doesn't exist for us, and is unread
		// 						'app.AppPkgDevMinimail' : {'$exists' : false},
		// 						'attributes.read.status' : 0
		// 					}
		// 				]
		// 			},{
		// 				'$and' : [
		// 					{
		// 						// exists as acted upon, and is marked as "undecided" still
		// 						'app.AppPkgDevMinimail' : {'$exists' : true},
		// 						'app.AppPkgDevMinimail.wait_until' : {"$exists" : false},
		// 						'app.AppPkgDevMinimail.done' : 0
		// 					}
		// 				]
		// 			}
		// 		]
		// 	};

		// 	// Get time of thread (affecting older threads only)
		// 	time_sec = App.Data.Store.Thread[this.options.threadid].attributes.last_message_datetime_sec;

		// 	// Add the condition that it must be older
		// 	conditions['attributes.last_message_datetime_sec'] = {
		// 		"$lte" :  time_sec // older = less-than-or-equal-to
		// 	};

		// } else if(this.options.type == 'delayed'){

		// 	// Get time of thread (affecting older threads only)
		// 	time_sec = App.Data.Store.Thread[this.options.threadid].app.AppPkgDevMinimail.wait_until;

		// 	// Delayed
		// 	conditions = {
		// 		'$and' : [
		// 			{
		// 				'app.AppPkgDevMinimail.wait_until' : {
		// 					'$lte' : time_sec
		// 				}
		// 			},
		// 			{
		// 				'app.AppPkgDevMinimail.done' : {
		// 					"$ne" : 1
		// 				}
		// 			}
		// 		]
		// 	};
		// } else {
		// 	// Failed finding the correct type
		// 	alert('Failed finding type');
		// 	return false;
		// }

		// // Run update command
		// Api.update({
		// 	data: {
		// 		model: 'Thread',
		// 		conditions: conditions,
		// 		multi: true, // edit more than 1? (yes)
		// 		paths: {
		// 			"$set" : {
		// 				"app.AppPkgDevMinimail.done" : 1
		// 			}
		// 		}
		// 	},
		// 	success: function(response){
		// 		// Successfully updated
		// 		response = JSON.parse(response);
		// 		if(response.code != 200){
		// 			// Updating failed somehow
		// 			// - this is bad, it means the action we thought we took, we didn't take
		// 			alert('Update may have failed');
		// 		}
		// 	}
		// });

		// // Assume update succeeded

		// // Mark all the visible ones
		// // - easy to see all the ones above (that haven't already had an action taken on them)
		// that.mass_action('done', this.options.type, time_sec);

		// return false;
	},

	click_delay: function(ev){
		// Delay older messages
		// - displayes DelayModal

		var that = this,
			elem = ev.currentTarget;

		// Display delay_modal Subview
		var subView = new App.Views.DelayModal({
			context: that,
			threadid: that.threadid,
			onComplete: that.after_delay_modal
		});
		$('body').append(subView.$el);
		subView.render();

		return false;

	},

	after_delay_modal: function(wait, save_text){

		var that = this;

		// Get this message's id
		// - mark everything older than this email that matches the conditions presented earlier
		// - must already be in the undecided, etc.
		var thread_id = this.options.threadid;

		// Return if a null value was sent through by DelayModal
		if(!wait){
			return false;
		}


		var incl_thread_ids = [];
		$('.thread[data-thread-type="'+ this.options.type +'"]').reverse().each(function(i, threadElem){
			if($(threadElem).hasClass('tripped')){
				// Already tripped, don't use this one
				return;
			}
			// Wait for this element to get triggered
			if(incl_thread_ids.length > 0){
				// Already found this element
				incl_thread_ids.push($(threadElem).attr('data-id'));
			} else if($(threadElem).attr('data-id') == that.options.threadid){
				incl_thread_ids.push($(threadElem).attr('data-id'));
			}
		});


		// Figure out delay in seconds
		var now_sec = parseInt(new Date().getTime() / 1000);
		var delay_time = wait.getTime() / 1000;
		var delay_seconds = parseInt(delay_time - now_sec);
		var in_seconds = now_sec + delay_seconds;

		// App.Plugins.Minimail.saveNewDelay(this.threadid,in_seconds,delay_seconds);

		// Fire event to be run in the future
		Api.event({
			data: {
				event: 'Minimail.wait_until_fired',
				delay: delay_seconds,
				obj: {
					text: "Emails are due"
				}
			},
			success: function(response){
				response = JSON.parse(response);

				if(response.code != 200){
					// Failed launching event
					alert('Failed launching event');
					dfd.reject(false);
					return;
				}

				// Save new delay also
				Api.update({
					data: {
						model: 'Thread',
						conditions: {
							'_id' : {
								'$in' : incl_thread_ids
							}
						},
						paths: {
							"$set" : {
								"app.AppPkgDevMinimail.wait_until" : in_seconds,
								"app.AppPkgDevMinimail.wait_until_event_id" : response.data.event_id,
								"app.AppPkgDevMinimail.done" : 0
							}
						}
					},
					success: function(response){
						response = JSON.parse(response);
						if(response.code != 200){
							// Shoot
							alert('Failed updating threads!');
						}
					}
				});

			}
		});


		// Fire event to modify move Email/Thread to Archive (it will be brought back later when wait_until is fired)
		_.each(incl_thread_ids, function(tmp_thread_id){

			Api.event({
				data: {
					event: 'Thread.action',
					obj: {
						'_id' : tmp_thread_id, // allowed to pass a thread_id here
						'action' : 'archive'
					}
				},
				success: function(response){
					response = JSON.parse(response);

					if(response.code != 200){
						// Failed launching event
						alert('Failed launching Thread.action2');
						dfd.reject(false);
						return;
					}

				}
			});

		});


		that.mass_action('delay', this.options.type, incl_thread_ids, wait, save_text);
		return;

		// if(this.options.type == 'undecided'){

		// 	// Build the conditions for the update
		// 	// - same conditions as on App.Collections.UndecidedThreads.undecided_conditions
		// 	var conditions = {
		// 		'$or' : [
		// 			{
		// 				'$and' : [
		// 					{
		// 						// doesn't exist for us, and is unread
		// 						'app.AppPkgDevMinimail' : {'$exists' : false},
		// 						'attributes.read.status' : 0
		// 					}
		// 				]
		// 			},{
		// 				'$and' : [
		// 					{
		// 						// exists as acted upon, and is marked as "undecided" still
		// 						'app.AppPkgDevMinimail' : {'$exists' : true},
		// 						'app.AppPkgDevMinimail.wait_until' : {"$exists" : false},
		// 						'app.AppPkgDevMinimail.done' : 0
		// 					}
		// 				]
		// 			}
		// 		]
		// 	}
			
		// 	var time_sec = App.Data.Store.Thread[this.options.threadid].attributes.last_message_datetime_sec;

		// 	// Add the condition that it must be older
		// 	conditions['attributes.last_message_datetime_sec'] = {
		// 		"$lte" :  time_sec // older = less-than-or-equal-to
		// 	};

		// 	// Run update command
		// 	Api.update({
		// 		data: {
		// 			model: 'Thread',
		// 			conditions: conditions,
		// 			paths: {
		// 				"$set" : {
		// 					"app.AppPkgDevMinimail.wait_until" : delay_datetime_in_seconds,
		// 					"app.AppPkgDevMinimail.wait_until_event_id" : response.data.event_id,
		// 					"app.AppPkgDevMinimail.done" : 0
		// 				}
		// 			}
		// 		},
		// 		success: function(response){
		// 			// Successfully updated
		// 			response = JSON.parse(response);
		// 			if(response.code != 200){
		// 				// Updating failed somehow
		// 				// - this is bad, it means the action we thought we took, we didn't take
		// 				alert('Update may have failed');
		// 			}
		// 		}
		// 	});

		// 	// Assume update succeeded

		// 	// Mark all the visible ones
		// 	// - easy to see all the ones above (that haven't already had an action taken on them)
		// 	that.mass_action('delay', this.options.type, time_sec, wait, save_text);

		// }

		return false;

	},

	mass_action: function(action, type, incl_thread_ids, wait, wait_save_text){
		// Mass animation on previous items
		// - action: done, delay (with additional info about delay datetime)
		// - type: undecided or delayed
		// - seconds: time in seconds to mark against older

		var that = this;

		// seconds = parseInt(seconds);
		// if(!seconds){
		// 	// Shoot
		// 	alert('bad seconds in mass_action');
		// 	return false;
		// }

		var waitTime = 0;
		$('.thread[data-thread-type="'+type+'"]').reverse().each(function(i, threadElem){

			// Choosing either last_message_datetime_sec or wait_until
			// - depends on undecided or delayed
			
			if(_.contains(incl_thread_ids, $(threadElem).attr('data-id'))){
				// Affected this one!

				// Slide the .thread-preview and show the Thread
				// - sliding based on type (delayed, undecided)
				var previewElem = $(threadElem).find('.thread-preview');

				// Slide depending on undecided/done
				if(action == 'done'){
					// Slide RIGHT for "done"

					$(previewElem).delay(waitTime).animate({
						left: $(threadElem).width(),
						opacity: 0
					},{
						duration: 500,
						complete: function(){
							// $(this).parents('.thread').slideUp();
							$(previewElem).removeClass('touch_start');
						}
					});

					// Add classes for done
					$(threadElem).addClass('tripped dragright');

				} else if(action == 'delay') {
					// Slide LEFT for delay

					$(previewElem).delay(waitTime).animate({
						right: $(threadElem).width(),
						opacity: 0
					},{
						duration: 500,
						complete: function(){
							// $(this).parents('.thread').slideUp();
							$(previewElem).removeClass('touch_start');
						}
					});

					// Add classes for delay
					$(threadElem).addClass('tripped dragleft');

					// Add text
					$(threadElem).find('.thread-bg-time p').html(wait_save_text);

				}

				waitTime += 100;

			}

		});

		that.close();

		return;
	},

	click_reply: function(ev){
		// Load the Reply route
		var that = this,
			elem = ev.currentTarget;

		// Set scroll position on parent before going to reply view
		that.options.Parent.set_scroll_position();

		// Launch router w/ thread_id
		// Backbone.history.loadUrl('reply/' + this.options.threadid);

		// Hide myself
		that.options.Parent.$el.addClass('nodisplay');

		// Build the subview
		that.subViewReply = new App.Views.CommonReply({
			threadid: this.options.threadid
		});
		// Add to window and render
		$('body').append(that.subViewReply.$el);
		that.subViewReply.render();

		// Listen for events

		// Canceled sending a reply
		that.subViewReply.ev.on('cancel',function(){

			// Close subview
			that.subViewReply.close();

			// Display Parent
			that.options.Parent.$el.removeClass('nodisplay');

			// Scroll to correct position
			that.options.Parent.$('.data-lsp').scrollTop(that.options.Parent.last_scroll_position);
			// console.log(that.options.Parent.last_scroll_position);
			// $('.all_threads').scrollTop(that.options.Parent.last_scroll_position);

		});

		return false;
	},

	click_note: function(ev){
		// Editing/writing the Note for the Thread
		var that = this,
			elem = ev.currentTarget;

		// Display a new subview with the note dialog box?
		// - want to keep Notes kinda short, right? 
		// - notes on the computer would
		// - want to prevent Notes from getting deleted accidentally (they probably contain only important information)
		// - treat notes as Todo objects? add/remove/edit individual notes? Each line is a different Note? 
		// - lots of improvements possible, keep it simple for now

		var pre_text = '';
		try {
			if(App.Data.Store.Thread[that.options.threadid].app.AppPkgDevMinimail.note){
				pre_text = App.Data.Store.Thread[that.options.threadid].app.AppPkgDevMinimail.note.toString();
			}
		} catch(err){
			// pass
		}

		// Prompt box for note
		var note_text = prompt('Thread Note',pre_text);

		// Update the note
		if(!note_text){
			// canceled, not updating
			return;
		}

		// Make API call to update
		Api.update({
			data: {
				model: 'Thread',
				id: that.options.threadid,
				paths: {
					"$set" : {
						"app.AppPkgDevMinimail.note" : note_text
					}
				}
			},
			success: function(){

			}
		});

		// Save locally (wrong way to do this, should happen via model/collection)
		App.Data.Store.Thread[that.options.threadid].app.AppPkgDevMinimail.note = note_text;

		// Update the view
		// - todo...
		App.Utils.Notification.toast('Updated Note');

		return false;

	},

	render: function() {
		var that = this;

		// Template
		var template = App.Utils.template('t_all_thread_options');

		// Write HTML
		this.$el.html(template());

		return this;
	}
});


App.Views.SelectEmailList = Backbone.View.extend({
	
	className: 'select_email_list',

	events: {
		'click .option' : 'choose_email'
	},

	initialize: function(options) {
		_.bindAll(this, 'render');

		// this.el = this.options.el;

	},

	choose_email: function(ev){
		// Chose one of the emails for the person

		var elem = ev.currentTarget;

		// Get email
		var email = $(elem).attr('data-email');

		// Add email to the parent page
		this.options.chose_email(email);

		// Show the parent
		$('body > .common_compose').removeClass('nodisplay');

		// Close this view
		this.close();

		return false;

	},

	render: function() {
		var that = this;
		// Data
		// var data = this.options.accounts.UserGmailAccounts;

		// Should start the updater for accounts
		// - have a separate view for Accounts?

		// Template
		var template = App.Utils.template('t_select_email_list');

		// Write HTML
		this.$el.html(template(this.options.emails));

		return this;
	}
});







// Base inbox view (dunno, now, later)
App.Views.Inbox_Base = Backbone.View.extend({
	
	className: 'all_thread_inside_view reverse_vertical',

	last_scroll_position: 0,

	events: {

		'click .multi-deselect' : 'multi_deselect',
		'click .multi-done' : 'multi_done',
		'click .multi-delay' : 'multi_delay',

		'multi-change .all_threads' : 'multi_options'

	},

	initialize: function(options) {
		var that = this;
		_.bindAll(this, 'render');
		_.bindAll(this, 'render_structure');
		_.bindAll(this, 'beforeClose');
		_.bindAll(this, 'after_multi_delay_modal');
		_.bindAll(this, 'mass_action');
		_.bindAll(this, 'multi_options');
		
		// App.Events.bind('new_email',this.refresh_and_render_threads);

		// View containers
		this._subViews = [];

		// removal containers
		// - for when "refresh" is called
		this._waitingToRemove = [];

		// Run after_init (each Inbox has a different versino for loading the correct search threads)
		var threadType = this.collection_init(); // keeps context
		this.threadType = threadType;

		// Continue with collection initiation
		this.start_thread_getting(threadType);


	},

	beforeClose: function(){
		// empty
	},

	// Custom close function for .all
	close: function(){
		console.log('closing Views.Inbox_Base (no .close for custom inbox view)');

		// // unbind
		// App.Events.off('new_email',this.refresh_and_render_threads);

		// // Stop listening
		// Api.Event.off(this.cacheListener);

	},

	set_scroll_position: function(){
		var that = this;
		
		// Set last scroll position
		this.last_scroll_position = this.$('.data-lsp').scrollTop();
		this.$el.attr('last-scroll-position',this.last_scroll_position);

	},

	start_thread_getting: function(threadType){
		var that = this;

		var useContext = {
			this: this,
			threadType: threadType
		};

		that.useCollection.on('reset', this.reset_threads, useContext); // completely changed collection (triggers add/remove)
		that.useCollection.on('sync', this.sync_threads, useContext); // completely changed collection (triggers add/remove)
		that.useCollection.on('add', this.add_thread, useContext); // added a new ThreadId
		that.useCollection.on('remove', this.remove_thread, useContext); // removed a ThreadId
		that.useCollection.on('change', this.change_thread, useContext); // somehow one changed?
		that.useCollection.fetchDefault(); // trigger record retrieving

		// Start the CacheWatcher for Delayed threads
		// - listening for events that impact the Threads we have
		// - pre-updating the cache, basically
		// - doesn't fire update events though, only if the cache is requested the next time

		// See if a cacheWatcher is already running
		// - start it if it is not running
		// if(!App.CacheWatcher.DelayedThreads){
			// need to start it (should already be started?)
		// }

		// This'll run until it get's closed, so I guess it might update the cache in the background?
		that.cacheListener = Api.Event.on({
			event: ['Thread.action','Email.new']
		},function(result){
			console.warn('Fetching new because Thread.action or Email.new');
			// App.Utils.Notification.debug.temp('Fetching delayed, silently');
			window.setTimeout(function(){
				console.log('cacheListener fired');
				// go through "waiting_to_remove"
				// _.each(that._waitingToRemove, function(elem, i){
				// 	// // Remove Thread's subView
				// 	// console.log('removing subview');
				// 	// console.log(elem);
				// 	// console.log(that._subViews);

				// 	// // Get subview to remove
				// 	// that._subViews = _(that._subViews).without(elem);
				// 	// $(elem.el).remove();

				// });

				// that.delayedCollection.fetchDelayed();
				that.useCollection.fetchDefault();

			},500); // wait 3 seconds before doing our .fetch (unclear why we are waiting?)
		});

		// Listen for refresh request
		this.on('refresh',this.refresh, this);

		// Listen for check_multi_select
		this.on('check_multi_select',this.multi_options, this);

		// Listen to local thread action
		// - delay
		// - done
		App.Events.on('Thread.done',function(thread_id){
			// Trigger the mass_action for animation
			// - might not actually affect any threads, but doesn't hurt
			that.mass_action('done', [thread_id]);
		}, this);
		App.Events.on('Thread.delay',function(thread_id, wait, wait_text){
			// Trigger the mass_action for animation
			// - might not actually affect any threads, but doesn't hurt
			that.mass_action('delay', [thread_id], wait, wait_text);
		}, this);

	},

	refresh: function(){
		var that = this;
		// Asked to refresh the page
		// - clear any missing elements, add any that need to be added
		// - it should look nice while adding/removing! 

		// go through "waiting_to_remove"
		that.remove_waitingToRemove();

		// Trigger fetches
		that.useCollection.fetchDefault();

		// At inbox zero?
		if(that.useCollection.length == 0){
			that.check_inbox_zero();
		}

		// Emit checker for multi-select
		this.trigger('check_multi_select');

		// Print out number of views
		console.log('number of views_1_');
		console.log(that.useCollection.length);

		return;

	},

	// refresh_fetch: function(){
	// 	// Fetch new emails after a refresh
	// 	var that = this;

	// 	// Trigger fetches
	// 	that.useCollection.fetchDefault();

	// 	// At inbox zero?
	// 	if(that.useCollection.length == 0){
	// 		that.check_inbox_zero();
	// 	}

	// 	// Print out number of views
	// 	console.log('number of views_2_');
	// 	console.log(that.useCollection.length);

	// },

	reset_threads: function(threads, options){
		var that = this; // not the view, passing context to 'add'

		// Should remove all existing views?
		// - yes?

		console.log('reset threads');

		// Add each Thread object
		// - passes individual Thread model
		that.useCollection.each(that.add_thread, this);

		console.log('reset delayed');
	},

	sync_threads: function(threads, options){
		var that = this.this; // view

		console.log('sync_delayed_threads');

		// Empty?
		if(that.useCollection.length == 0){
			// alert('both zero');
			// console.warn('zero1');
			// that.check_inbox_zero();
		}

		// Scroll to bottom
		that.scroll_to_bottom = true;

	},

	add_thread: function(thread){
		var that = this.this,
			threadType = this.threadType;

		// Got a new Thread._id, so we need to go get the corresponding ThreadFull model
		console.log('add_thread');

		// Add to the DOM
		that.$('.inbox_zero').remove();

		// Get index (position) of this Thread
		var idx = that.useCollection.indexOf(thread);

		// Create the View
		var dv = new App.Views.SubCommonThread({
			model : thread,
			threadType: threadType, // NEED TO ADD THREADTYPE!!! TODO
			idx_in_collection: idx,
			fadein: true,
			parentView: that
		});

		var dvView = dv.render().el;

		// Add to the correct place
		// - not actually rendering yet though
		var prev = that.$('.all_threads').find('.thread:eq('+idx+')');
		// prev = that.$('li:eq(' + idx + ')');
		console.log('prev');
		console.log(prev);
		if (prev.length > 0) {
			prev.after(dvView); // render after
		} else {
			that.$('.all_threads').prepend(dvView);
		}

		// Add to subViews
		that._subViews.push(dv);

		// Re-sort the views we have
		that._subViews = _.sortBy(that._subViews,function(sV){
			return sV.options.idx_in_collection;
		});






		// Full Thread
		thread.Full = new App.Models.ThreadFull({
			_id: thread.toJSON()._id
		});


		// Checking if the Thread is ready to be displayed
		// - seeing if it actually should be displayed too
		thread.on('check_display_ready', function(){
			var that = this.this;

			// Must have Full ready
			if(!thread.FullReady || !thread.EmailReady){
				// console.warn('thread.check_display_ready = not ready');
				return;
			}
			// Already rendered this Thread?
			if(thread.Rendered){
				// Show the change in the view
				console.warn('Already rendered (need to change the view!)');
				return;
			}
			thread.Rendered = true;

			// Fire the render_ready on the dvView
			dv.trigger('render_ready');

			// // Remove .inbox_zero if it exists
			// // - move this to the actual "I'm ready to render" method
			// that.$('.inbox_zero').remove();
			
			// console.log('Thread is ready to be rendered');

			// // Get index (position) of this Thread
			// var idx = that.useCollection.indexOf(thread);

			// // Create the View
			// var dv = new App.Views.SubCommonThread({
			// 	model : thread,
			// 	threadType: threadType, // NEED TO ADD THREADTYPE!!! TODO
			// 	idx_in_collection: idx,
			// 	fadein: true,
			// 	parentView: that
			// });

			// // Add to views
			// that._subViews.push(dv);

			// // Re-sort the views we have
			// that._subViews = _.sortBy(that._subViews,function(sV){
			// 	return sV.options.idx_in_collection;
			// });

			// // Figure out the index of this view
			// var thread_idx = that._subViews.indexOf(dv);
			// // console.warn('thread_idx: ' + thread.Full.toJSON().original.subject);
			// // console.log(thread_idx);
			// // console.dir(that._subViews[this.threadType]);

			// // Render this fucker in the correct place meow

			// // If the view has been rendered, then immediately append views
			// if(that._rendered){
			// 	// Insert it into the correct place
			// 	// - at bottom

			// 	// What is already displayed?
			// 	// - we are going to .before it to the correct elements (or .append to .all_threads if none are showing yet)
			// 	if(_.size(that._subViews) != 1){
			// 		// Already displayed at least one, so we need to figure out where this view is going

			// 		// // iterate over existing views to get the index, and display based on that order? 
			// 		// // - they are already ordered in the collection, but not in the view
			// 		// console.info('already 1 or more');
			// 		// console.log('.thread[data-thread-type="'+this.threadType+'"]:nth-of-type('+idx+')');

			// 		// // Find the rendered subView that is directly before this one
			// 		// // - just going to .after on that one
			// 		// var insertPosition = 1; // at the beginning!
			// 		// var diff = 10000;
			// 		// _.each(that._subViews[this.threadType], function(subView, idx, lst){

			// 		// });
					
			// 		console.log('dsize != 1: ' + _.size(that._subViews));
			// 		console.log('thread_idx:' + thread_idx);

			// 		var $elem = that.$('.all_threads').find('.thread[data-thread-type="'+threadType+'"]:nth-of-type('+thread_idx+')');
			// 		console.log($elem.length);
			// 		$elem.after(dv.render().el);

			// 		// that.$('.all_threads').find('.thread[data-thread-type="'+this.threadType+'"]:nth-of-type('+idx+')').after(dv.render().el);
			// 		// that.$('.all_threads').append(dv.render().el);
			// 	} else {
			// 		// No other ones, just append it (lowest on the list)
			// 		// console.info('no other ones');

			// 		// Is the structure already set up?
			// 		if(!that.$('.all_threads').length){
			// 			console.log('rendering all_threads structure');
			// 			that.render_structure();
			// 		}

			// 		that.$('.all_threads').append(dv.render().el);
			// 	}

			// 	// Resize the scrollable part (.all_threads)
			// 	that.resize_fluid_page_elements();
			// 	that.resize_scroller();

			// 	// Scroll to bottom
			// 	that.$('.scroller').scrollTop(10000);

			// }

			// // And add it to the collection so that it's easy to reuse.
			// that._subViews[this.threadType].push(dv);

			// done
			// console.info('Rendered Thread (complete w/ emails)');

		}, this);

		thread.on('rerender', function(){
			// Something changed, need to re-render
			var that = this.this;

			// Must have already rendered the thread
			if(that._rendered){
				// See if the View is already displayed
				console.log('view already displayed?');
				// that.$('.all_threads').append(dv.render().el);
			}
		}, this);

		// Listen for "change" event
		thread.Full.on('change', function(threadFull){
			// Mark thread as ready
			// - this fires immediately if anything is cached
			// - otherwise it fires if something is different from the cached version
			if(!thread.FullReady){
				thread.FullReady = true;
				thread.trigger('check_display_ready');
			}
		}, this);

		thread.Full.fetchFull();

		// Emails for Thread
		// - we want to know after all the emails have been loaded for the Thread
		thread.Email = new App.Collections.EmailsFull();

		thread.Email.on('reset', function(){
			if(!thread.EmailReady){
				thread.EmailReady = true;
				thread.trigger('check_display_ready');
			}
		}, this); // completely changed collection (triggers add/remove)

		thread.Email.on('sync', function(Emails){
			// Fires after add/remove have completed?
			// console.info('EmailSync');

			if(Emails.length > 0 && !thread.EmailReady){
				thread.EmailReady = true;
				thread.trigger('check_display_ready');
			}
		}, this); // completely changed collection (triggers add/remove)

		thread.Email.on('add', function(emailFullModel){
			// console.log('EmailAdd');
			// console.log(emailFullModel.toJSON()._id);
		}, this); // added a new EmailFull

		thread.Email.on('remove', function(emailFullModel){
			// console.log('EmailRemove');
			// console.log(emailFullModel.get('id'));
		}, this); // remove a new EmailFull
		
		thread.Email.on('change', function(emailFullModel){
			console.log('EmailChange');
		}, this); // an email is slightly different now (re-render)
		
		// trigger EmailFull collection retrieving
		// console.info('ids1');
		// console.info(thread.get('_id'));
		thread.Email.fetch_by_thread_id({
			ids: [thread.get('_id')],
			cachePrefix: thread.get('_id')
		});

		// Update count for number
		var eventData = {
			count: that.useCollection.length,
			type: that.threadType
		};
		App.Events.trigger('Main.UpdateCount', eventData);

	},

	remove_thread : function(model) {
		var that = this.this;
		
		console.log('remove_thread');

		var viewToRemove = _(that._subViews).filter(function(cv) { return cv.model === model; });
		if(viewToRemove.length < 1){
			return;
		}
		viewToRemove = viewToRemove[0];

		// that._subViews[this.threadType] = _(that._subViews[this.threadType]).without(viewToRemove);
		console.log(viewToRemove);
		// Change the view's opacity:
		// - or change based on whatever happened to it?
		// - also depends on if it was a remote change, right? 
		$(viewToRemove.el).css('opacity', 0.2);

		// don't actually remove it?
		// - only remove it when refresh is called
		that._waitingToRemove.push(viewToRemove);

		// if(that._rendered && viewToRemove){
		// 	$(viewToRemove.el).remove();
		// }

		// Update count for number
		var eventData = {
			count: that.useCollection.length,
			type: that.threadType
		};

		App.Events.trigger('Main.UpdateCount', eventData);

	},

	change_thread: function(model){
		// Change triggered
		console.log('change?');
	},

	all_emails: function(emails){
		var threadModel = this; // Thread Model

		console.log('all_emails triggered');
		console.log(emails);
		// console.log('THIS');
		// console.log(this.toJSON()); // json thread object
		if(_.size(emails) < 1){
			// No emails found for Thread
			// - don't show this Thread?
			console.log('less than 1');
			console.log();
		} else {
			// Trigger that the Thread is ready
			console.log("READY");
			this.trigger('ready_to_display', threadModel);
		}
		// emails.each(function(val){
		// 	console.log('val');
		// 	console.log(val);
		// });
	},

	reset_emails: function(){
		console.log('reset_emails');	
	},

	thread_ready: function(thread){
		var that = this;
	},

	multi_options: function(){
		// Displays (or hides) multi-select options
		var that = this;

		// See if there are any views that are multi-selected
		if(this.$('.multi-selected').length > 0){
			this.show_multi_options = true;
			this.$('.multi_select_options').removeClass('no_multi_select');
		} else {
			this.show_multi_options = false;
			this.$('.multi_select_options').addClass('no_multi_select');
		}

		// // On or off?
		// // if(this.$('.all_threads').hasClass('multi-select-mode')){
		// if(this.show_multi_options){
		// 	// Just turned on
		// 	this.$('.multi_select_options').removeClass('no_multi_select');
		// } else {
		// 	// Turned off
		// 	this.$('.multi_select_options').addClass('no_multi_select');
		// }
		
		return false;
	},

	multi_deselect: function(ev){
		// De-select any that are selected
		var that = this;

		// Remove selected
		$('.all_threads .multi-selected').removeClass('multi-selected')

		// Remove multi-select mode
		$('.all_threads').removeClass('multi-select-mode')

		// Call multi-options
		that.multi_options();

		return false;
	},

	multi_done: function(ev){
		// Mark all selected as Done
		var that = this,
			elem = ev.currentTarget;

		// Get all selected
		// - get Thread._id
		// - make sure to not select ones that are already processed

		// Get all elements above this one
		// - and including this one
		// - but not ones that have already been processed (wouldn't anyways)

		var incl_thread_ids = [];
		$('.multi-selected').each(function(i, threadElem){
			// Wait for this element to get triggered
			var $threadParent = $(threadElem).parent();
			incl_thread_ids.push($threadParent.attr('data-id'));
			// if(incl_thread_ids.length > 0){
			// 	// Already found this element
			// 	incl_thread_ids.push($(threadElem).attr('data-id'));
			// } else if($(threadElem).attr('data-id') == that.options.threadid){
			// 	incl_thread_ids.push($(threadElem).attr('data-id'));
			// }
		});

		// Make sure some are included
		if(!incl_thread_ids || incl_thread_ids.length < 1){
			alert('None Selected');
			return false;
		}
		
		// Run update command
		Api.update({
			data: {
				model: 'Thread',
				conditions: {
					'_id' : {
						'$in' : incl_thread_ids
					}
				},
				multi: true, // edit more than 1? (yes)
				paths: {
					"$set" : {
						"app.AppPkgDevMinimail.done" : 1
					}
				}
			},
			success: function(response){
				// Successfully updated
				response = JSON.parse(response);
				if(response.code != 200){
					// Updating failed somehow
					// - this is bad, it means the action we thought we took, we didn't take
					alert('Update may have failed');
				}
			}
		});

		
		// Fire event to modify move Email/Thread to Archive (it will be brought back later when wait_until is fired)
		_.each(incl_thread_ids, function(tmp_thread_id){
			
			Api.event({
				data: {
					event: 'Thread.action',
					obj: {
						'_id' : tmp_thread_id, // allowed to pass a thread_id here
						'action' : 'archive'
					}
				},
				success: function(response){
					response = JSON.parse(response);

					if(response.code != 200){
						// Failed launching event
						alert('Failed launching Thread.action2');
						dfd.reject(false);
						return;
					}

				}
			});

		});
		
		// Take mass action
		that.mass_action('done', incl_thread_ids);

		// De-select
		this.multi_deselect();

		return false;
	},

	multi_delay: function(ev){
		// Delay messages
		// - displayes DelayModal
		// - trigger animation (mass_action)

		var that = this,
			elem = ev.currentTarget;

		var incl_thread_ids = [];
		$('.multi-selected').each(function(i, threadElem){
			// Wait for this element to get triggered
			var $threadParent = $(threadElem).parent();
			incl_thread_ids.push($threadParent.attr('data-id'));
			// if(incl_thread_ids.length > 0){
			// 	// Already found this element
			// 	incl_thread_ids.push($(threadElem).attr('data-id'));
			// } else if($(threadElem).attr('data-id') == that.options.threadid){
			// 	incl_thread_ids.push($(threadElem).attr('data-id'));
			// }
		});

		// Make sure some are included
		if(!incl_thread_ids || incl_thread_ids.length < 1){
			alert('None Selected');
			return false;
		}

		// Show multi-options
		$('.multi_select_options').addClass('nodisplay');

		// Display delay_modal Subview
		var subView = new App.Views.DelayModal({
			context: that,
			onComplete: that.after_multi_delay_modal
		});
		$('body').append(subView.$el);
		subView.render();

		return false;

	},

	after_multi_delay_modal: function(wait, save_text){
		var that = this;

		// Show multi-options
		$('.multi_select_options').removeClass('nodisplay');

		// Return if a null value was sent through by DelayModal
		if(!wait){
			return false;
		}

		var incl_thread_ids = [];
		$('.multi-selected').each(function(i, threadElem){
			// Wait for this element to get triggered
			var $threadParent = $(threadElem).parent();
			incl_thread_ids.push($threadParent.attr('data-id'));
		});

		// Make sure some are included
		if(!incl_thread_ids || incl_thread_ids.length < 1){
			alert('None Selected');
			return false;
		}

		// Figure out delay in seconds
		var now_sec = parseInt(new Date().getTime() / 1000);
		var delay_time = wait.getTime() / 1000;
		var delay_seconds = parseInt(delay_time - now_sec);
		var in_seconds = now_sec + delay_seconds;

		// App.Plugins.Minimail.saveNewDelay(this.threadid,in_seconds,delay_seconds);

		// Fire event to be run in the future when these are due
		// - causes a bunch of events to fire at one time?
		// - what if one of the due ones cancels?? (breaks it)
		Api.event({
			data: {
				event: 'Minimail.wait_until_fired',
				delay: delay_seconds,
				obj: {
					text: "Emails are due"
				}
			},
			success: function(response){
				response = JSON.parse(response);

				console.log(JSON.stringify(response));

				if(response.code != 200){
					// Failed launching event
					alert('Failed launching event');
					dfd.reject(false);
					return;
				}

				// Save new delay also
				Api.update({
					data: {
						model: 'Thread',
						conditions: {
							'_id' : {
								'$in' : incl_thread_ids
							}
						},
						multi: true, 
						paths: {
							"$set" : {
								"app.AppPkgDevMinimail.wait_until" : in_seconds,
								"app.AppPkgDevMinimail.wait_until_event_id" : response.data.event_id,
								"app.AppPkgDevMinimail.done" : 0
							}
						}
					},
					success: function(response){
						response = JSON.parse(response);
						if(response.code != 200){
							// Shoot
							alert('Failed updating threads!');
						}
					}
				});

			}
		});


		// Fire event to modify move Email/Thread to Archive (it will be brought back later when wait_until is fired)
		_.each(incl_thread_ids, function(tmp_thread_id){

			Api.event({
				data: {
					event: 'Thread.action',
					obj: {
						'_id' : tmp_thread_id, // allowed to pass a thread_id here
						'action' : 'archive'
					}
				},
				success: function(response){
					response = JSON.parse(response);

					if(response.code != 200){
						// Failed launching event
						alert('Failed launching Thread.action2');
						dfd.reject(false);
						return;
					}

				}
			});

		});

		// Initiate mass action
		// - even if only 1 thing was changed
		that.mass_action('delay', incl_thread_ids, wait, save_text);

		// De-select
		this.multi_deselect();

		return false;

	},

	refresh_data: function(){
		// Refresh the data for the view

	},

	mass_action: function(action, incl_thread_ids, wait, wait_save_text){
		// Mass animation on previous items
		// - action: done, delay (with additional info about delay datetime)
		// - type: undecided or delayed
		// - seconds: time in seconds to mark against older


		// "type" no longer used because ids are specified

		var that = this;

		// seconds = parseInt(seconds);
		// if(!seconds){
		// 	// Shoot
		// 	alert('bad seconds in mass_action');
		// 	return false;
		// }

		var waitTime = 0;
		$('.thread').each(function(i, threadElem){

			// Choosing either last_message_datetime_sec or wait_until
			// - depends on undecided or delayed
			
			if(_.contains(incl_thread_ids, $(threadElem).attr('data-id'))){
				// Affected this one!

				console.log('looking at views: ' + that.threadType);
				var viewToRemove = _(that._subViews).filter(function(cv) { 
					console.log(cv.model.get('_id'));
					return cv.model.get('_id') === $(threadElem).attr('data-id'); 
				});

				// Returned an array, damnit
				if(viewToRemove.length > 0){
					viewToRemove = viewToRemove[0];
				} else {
					// Didn't find the view
					console.log('Did not find the view in ' + that.threadType);
					return;
				}

				// Sometimes is null
				// - dunno why the fuck
				if(!viewToRemove || viewToRemove == null){
					console.log('ERROR - NULL viewToRemove');
					console.log(viewToRemove);
					return;
				}

				// see if .el is also valid
				if(!viewToRemove.el){
					console.log('ERROR2 - Null viewToRemove.el');
					console.log(viewToRemove);
					console.log(viewToRemove.el);
					return;
				}

				console.log('found view');
				console.log($(threadElem).attr('data-id'));
				console.log(viewToRemove);

				// Change the view's opacity:
				$(viewToRemove.el).css('opacity', 0.2);

				// don't actually remove it?
				// - only remove it when refresh is called
				that._waitingToRemove.push(viewToRemove);



				// Slide the .thread-preview and show the Thread
				// - sliding based on type (delayed, undecided)
				var previewElem = $(threadElem).find('.thread-preview');

				// Slide depending on undecided/done
				if(action == 'done'){
					// Slide RIGHT for "done"

					$(previewElem).delay(waitTime).animate({
						left: $(threadElem).width(),
						opacity: 0
					},{
						duration: 500,
						complete: function(){
							// $(this).parents('.thread').slideUp();
							$(previewElem).removeClass('touch_start');
						}
					});

					// Add classes for done
					$(threadElem).addClass('tripped dragright');

				} else if(action == 'delay') {
					// Slide LEFT for delay

					$(previewElem).delay(waitTime).animate({
						right: $(threadElem).width(),
						opacity: 0
					},{
						duration: 500,
						complete: function(){
							// $(this).parents('.thread').slideUp();
							$(previewElem).removeClass('touch_start');
						}
					});

					// Add classes for delay
					$(threadElem).addClass('tripped dragleft');

					// Add text
					$(threadElem).find('.thread-bg-time p').html(wait_save_text);

				}

				waitTime += 100;

			}

		});

	},


	render_init: function(){
		// Render the loading screen
		var that = this;

		// Template
		var template = App.Utils.template('t_all_init');

		// Write HTML
		this.$el.html(template());

		return this;

	},


	render_structure: function(){
		// Render the loading screen
		var that = this;

		// Template
		var template = App.Utils.template('t_all_structure');

		// Write HTML
		this.$el.html(template(this.threadType));

		return this;

	},

	render_threads: function(threads){
		
		// Render the loading screen
		var that = this;

		// Template
		var template = App.Utils.template('t_all');

		// Write HTML
		this.$el.html(template(threads));
		
		// Resize the scrollable part (.all_threads)
		this.resize_fluid_page_elements();
		this.resize_scroller();

		// Scroll to bottom
		this.$('.scroller').scrollTop(10000);

		return this;
		
	},

	check_inbox_zero: function(){
		// See if we should render inbox-zero
		if(this.useCollection.length == 0){
			this.render_zero();
			this.remove_waitingToRemove();
		}

	},
	render_zero: function(){
		// Render the "inbox zero" screen
		var that = this;

		// Already rendered?
		// - happens when refreshing pretty often
		if(this.$('.inbox_zero').length > 0){
			return this;
		}

		// Template
		var template = App.Utils.template(this.zero_template);

		// Write HTML
		this.$el.prepend(template(this.threadType));

		return this;
		
	},

	remove_waitingToRemove: function(){
		 var that = this;

		 console.log('Trying remove_waitingToRemove');
		_.each(this._waitingToRemove, function(elem, i){
			// Remove Thread's subView

			console.log('remove_waitingToRemove');
			// console.log(elem[0]);
			// console.log(elem);
			// console.log(elem.toString());
			// console.log(elem.el);
			// console.log(elem.el);

			// // Get subview to remove
			// that._subViews = _(that._subViews).without(elem[0]);

			// // Listen for transition end before removing the element entirely
			// $(elem[0].el).bind("transitionend webkitTransitionEnd oTransitionEnd MSTransitionEnd", function(){
			// 	$(elem[0].el).remove();
			// });
			// $(elem[0].el).addClass('closing_nicely');

			// Get subview to remove
			that._subViews = _(that._subViews).without(elem);

			// Listen for transition end before removing the element entirely
			$(elem.el).bind("transitionend webkitTransitionEnd oTransitionEnd MSTransitionEnd", function(){
				console.log("__looking to remove");
				elem.remove();
			});
			$(elem.el).addClass('closing_nicely');

		});

	},

	render: function() {
		var that = this;

		if(this._rendered){
			console.log('rendered');

			// Re-bind events
			this.delegateEvents()

			// Re-bind events for subViews
			_(that._subViews).each(function(v) {
				v.trigger('rebind');
			});

			// Remove _waitingToRemove things
			this.remove_waitingToRemove();

			// Resize the scrollable part (.all_threads)
			this.resize_fluid_page_elements();
			this.resize_scroller();

			// Scroll to bottom (yeah?)
			this.$('.scroller').scrollTop(10000);

			// Multi-select binding 
			// this.$('.all_threads').on('multi-change',that.multi_options); // now in view.events

			return this;
		}

		this._rendered = true;

		// Render initial body
		// - container, basically
		// this.render_init();
		this.render_structure();
		console.log('Rendering structure');

		// Render each of the views into the correct places

		// Undecided views first
		_(that._subViews).each(function(uv) {
			that.$('.all_threads').append(uv.render().el);
		});

		// Resize the scrollable part (.all_threads)
		this.resize_fluid_page_elements();
		this.resize_scroller();

		// Scroll to bottom
		this.$('.scroller').scrollTop(10000);

		// Multi-select
		// this.$('.all_threads').on('multi-change',that.multi_options); // now in view.events


		// // Delayed views second (at the bottom)
		// _(that._delayedViews).each(function(dv) {
		// 	this.$('.all_threads').append(dv.render().el);
		// });

		// // Refresh and render
		// this.refresh_and_render_threads();

		// App.Utils.Storage.get('delayed_threads_and_emails')
		// 	.then(function(val){
		// 		if(val){
		// 			// value exists, render
		// 			// Recombine threads
		// 			that.recombine_threads()
		// 				.then(function(threads){

		// 					// Render new Thread list
		// 					that.render_threads(threads);
		// 				});
		// 		} else {
		// 			// doesn't exist
		// 			// - already refreshing
		// 		}
		// 	});

		// How old is it?
		// Do we need to do a refresh?

		// View is based on what data we do have, and a view makes sure the new data is being found? 

		return this;
	}
});


// Base inbox view (dunno, now, later)
App.Views.Inbox_Dunno = App.Views.Inbox_Base.extend({

	zero_template: 't_all_new_done',

	collection_init: function(){
		var that = this;

		// Set collection to use
		that.useCollection = new App.Collections.UndecidedThreads();

		// Return type of threads to display
		return 'undecided';
	},

});

// Base inbox view (dunno, now, later)
App.Views.Inbox_Now = App.Views.Inbox_Base.extend({

	zero_template: 't_all_due_done',
	
	collection_init: function(){
		var that = this;

		// Set collection to use
		that.useCollection = new App.Collections.DelayedThreads();

		// Return type of threads to display
		return 'delayed';
	},

});

// Base inbox view (dunno, now, later)
App.Views.Inbox_Later = App.Views.Inbox_Base.extend({

	zero_template: 't_all_later_done',

	collection_init: function(){
		var that = this;

		// Set collection to use
		that.useCollection = new App.Collections.LaterThreads();

		// Return type of threads to display
		return 'later';
	},

});

App.Views.SubSearchesEmail = Backbone.View.extend({
	
	className: 'thread no_text_select nodisplay',

	events: {

	},

	initialize: function(options) {
		var that = this;
		_.bindAll(this, 'render');
		_.bindAll(this, 'render_full');

		// Fade in?
		// if(this.options.fadein){
		// 	this.el.className = this.className + ' fade-in';
		// }

		// Have model?
		if(!this.model){
			console.log('==Missing model');
		} else {
			// console.log('model OK');
		}

		// Wait for trigger
		this.on('render_full',this.render_full, this);

	},

	render_full: function(){
		// Have the full one now
		var that = this;

		this.$el.attr('data-id',this.model.EmailFull.toJSON().attributes.thread_id);
		this.$el.attr('data-thread-type','searched');
		this.$el.removeClass('nodisplay');

		// Template
		var template = App.Utils.template('t_search_emails_email_results_item');
		
		this.$el.html(template(this.model.EmailFull.toJSON()));

		return this;
	},

	render: function(){
		// Rendering a placeholder
		var that = this;

		// Template
		var template = App.Utils.template('t_search_emails_email_results_item_loading');
		// console.log(template());

		this.$el.html(template());
		return this;
	}

});


App.Views.SubCommonThread = Backbone.View.extend({
	
	className: 'thread no_text_select',

	events: {
		
		'shorttap .thread-preview' : 'view_email',
		'longtap .thread-preview' : 'preview_thread',
		'click .thread-preview' : 'click_view_email'

	},

	initialize: function(options) {
		var that = this;
		_.bindAll(this, 'render');
		_.bindAll(this, 'after_delay_modal');

		// Fade in?
		if(this.options.fadein){
			// this.el.className = this.className + ' fade-in';
		}

		// threadType
		this.threadType = this.options.threadType;

		// Have model?
		if(!this.model){
			console.log('==Missing model');
		} else {
			// console.log('model OK');
		}

		// Have parentView?
		this.parentView = this.options.parentView;

		// Listen for rebinding events
		this.on('rebind', this.rebind, this);

		// Listen for render_ready
		this.on('render_ready', this.render_ready, this);
	},

	beforeClose: function(){

	},

	rebind: function(){
		var that = this;

		// Re-bind the events

		this.delegateEvents();


		// Draggable
		if(usePg){

			this.$(".thread-preview").on('touchstart',App.Plugins.Minimail.thread_main.start);
			this.$(".thread-preview").on('touchmove',App.Plugins.Minimail.thread_main.move);
			this.$(".thread-preview").on('touchend',App.Plugins.Minimail.thread_main.end);

			
		} else {

			this.$(".thread-preview").on('mousedown',App.Plugins.Minimail.thread_main.start);
			this.$(".thread-preview").on('mousemove',App.Plugins.Minimail.thread_main.move);
			this.$(".thread-preview").on('mouseup',App.Plugins.Minimail.thread_main.end);
			
		}

		// React to the view being done or delayed
		// this.$(".thread-preview").on('done_or_delay');


	},

	after_delay_modal: function(wait, save_text){
		alert('How did you get here?');
		var that = this;

		// Show multi-options
		$('.multi_select_options').removeClass('nodisplay');

		// Return if a null value was sent through by DelayModal
		if(!wait){
			return false;
		}

		var incl_thread_ids = [];
		$('.multi-selected').each(function(i, threadElem){
			// Wait for this element to get triggered
			var $threadParent = $(threadElem).parent();
			incl_thread_ids.push($threadParent.attr('data-id'));
		});

		// Make sure some are included
		if(!incl_thread_ids || incl_thread_ids.length < 1){
			alert('None Selected');
			return false;
		}

		// Figure out delay in seconds
		var now_sec = parseInt(new Date().getTime() / 1000);
		var delay_time = wait.getTime() / 1000;
		var delay_seconds = parseInt(delay_time - now_sec);
		var in_seconds = now_sec + delay_seconds;

		// App.Plugins.Minimail.saveNewDelay(this.threadid,in_seconds,delay_seconds);

		// Fire event to be run in the future
		Api.event({
			data: {
				event: 'Minimail.wait_until_fired',
				delay: delay_seconds,
				obj: {
					text: "Emails are due"
				}
			},
			success: function(response){
				response = JSON.parse(response);

				console.log(JSON.stringify(response));

				if(response.code != 200){
					// Failed launching event
					alert('Failed launching event');
					dfd.reject(false);
					return;
				}

				// Save new delay also
				Api.update({
					data: {
						model: 'Thread',
						conditions: {
							'_id' : {
								'$in' : incl_thread_ids
							}
						},
						paths: {
							"$set" : {
								"app.AppPkgDevMinimail.wait_until" : in_seconds,
								"app.AppPkgDevMinimail.wait_until_event_id" : response.data.event_id,
								"app.AppPkgDevMinimail.done" : 0
							}
						}
					},
					success: function(response){
						response = JSON.parse(response);
						if(response.code != 200){
							// Shoot
							alert('Failed updating threads!');
						}
					}
				});

			}
		});


		// Fire event to modify move Email/Thread to Archive (it will be brought back later when wait_until is fired)
		_.each(incl_thread_ids, function(tmp_thread_id){

			Api.event({
				data: {
					event: 'Thread.action',
					obj: {
						'_id' : tmp_thread_id, // allowed to pass a thread_id here
						'action' : 'archive'
					}
				},
				success: function(response){
					response = JSON.parse(response);

					if(response.code != 200){
						// Failed launching event
						alert('Failed launching Thread.action2');
						dfd.reject(false);
						return;
					}

				}
			});

		});

		// Initiate mass action
		// - even if only 1 thing was changed
		that.mass_action('delay', incl_thread_ids, wait, save_text);

		// De-select
		this.multi_deselect();

		return false;

	},

	subViewThreadOptions: {},
	preview_thread: function(ev){
		// Preview a thread
		var that = this,
			elem = ev.currentTarget;

		var threadElem = $(elem).parents('.thread');
		
		// In multi-select mode?
		if(this.parentView.show_multi_options){
		// if(this.$el.parents('.all_threads').hasClass('multi-select-mode')){
			
			// Already selected?
			// alert($(elem).attr('class'));
			if($(elem).hasClass('multi-selected')){
				
				// un-selected
				$(elem).removeClass('multi-selected');

				// Anybody else selected?
				if($('.multi-selected').length < 1){
					// turn of multi-select mode
					$(elem).parents('.all_threads').removeClass('multi-select-mode');
				}

			} else {
				// select row
				$(elem).addClass('multi-selected');
			}

			return false;
		}

		// Expand/shrink
		if($(elem).hasClass('removed_ellipsis')){
			// Shrinking

			// Add ellipses back
			$(elem).removeClass('removed_ellipsis previewing');
			$(elem).find('.ellipsis_removed').addClass('ellipsis').removeClass('ellipsis_removed');

			// Close subViews
			_.each(that.subViewThreadOptions,function(subView){
				subView.close();
			});

		} else {
			// Expanding

			// Re-add other ellipses
			$('.thread-preview').removeClass('removed_ellipsis previewing');
			$('.thread-preview').find('.ellipsis_removed').addClass('ellipsis').removeClass('ellipsis_removed');

			// Close other subViews
			_.each(that.subViewThreadOptions,function(subView){
				subView.close();
			});

			// Remove ellipsis
			$(elem).addClass('removed_ellipsis previewing');
			$(elem).find('.ellipsis').addClass('ellipsis_removed').removeClass('ellipsis');

			// Create sub view with options
			var subViewKey = $(elem).attr('data-thread-id');
			that.subViewThreadOptions[subViewKey] = new App.Views.ThreadOptions({
				Parent: that,
				ThreadElem: threadElem,
				threadid: subViewKey,
				type: $(threadElem).attr('data-thread-type')
			});
			// App.router.showView('subthreadoptions',that.subViewThreadOptions[subViewKey]);//.render();
			that.subViewThreadOptions[subViewKey].render();

			// Write HTML before element
			// - inserts a holder that handles positioning
			$(elem).parent().before(that.subViewThreadOptions[subViewKey].$el);

			// re-scroll to account for display
			// alert(that.subViewThreadOptions[subViewKey].$el.height());
			var heightObj = that.subViewThreadOptions[subViewKey].$el.outerHeight() + 10;
			$('.all_threads').scrollTop( $('.all_threads').scrollTop() + heightObj );
			// $('.all_threads').scrollTop($(document).height() + App.Data.xy.win_height);
			// that.$el.scrollTop(that.$el.scrollTop() + 20);
			
		}


		return false;

	},

	click_view_email: function (ev){
		// Clicked
		// - only used by testing browser
		if(usePg){
			return false;
		}

		// alert('must be web');
		this.preview_thread(ev);
		// this.view_email(ev);

		// var elem = ev.currentTarget,
		// 	threadElem = $(elem).parents('.thread');

		// var thread_id = $(threadElem).attr('data-id');

		// // Hide thread preview
		// // $(this).parents('.thread').slideUp('slow');
		// $(elem).animate({
		// 	left: -1 * $(elem).parents('.thread').width()
		// },{
		// 	complete: function(){
		// 		// $(this).parents('.thread').slideUp();
		// 		$(elem).removeClass('touch_start');
		// 	}
		// });

		// // Display delay_modal Subview
		// var subView = new App.Views.DelayModal({
		// 	context: this,
		// 	threadid: thread_id
		// });
		// $('body').append(subView.$el);
		// subView.render();

	},

	view_email: function(ev){
		// View an individual email thread
		var that = this,
			elem = ev.currentTarget,
			threadElem = $(elem).parents('.thread');

		// In multi-select mode?
		if(this.parentView.show_multi_options){
		// if(this.$el.parents('.all_threads').hasClass('multi-select-mode')){
			
			// Already selected?
			// alert($(elem).attr('class'));
			if($(elem).hasClass('multi-selected')){
				
				// un-selected
				$(elem).removeClass('multi-selected');

				// Anybody else selected?
				// - triggers the "checker" on the parentView
				console.info('triggering check_multi_select');
				that.parentView.trigger('check_multi_select');
				// if($('.multi-selected').length < 1){
				// 	// turn off multi-select mode?
				// 	$(elem).parents('.all_threads').removeClass('multi-select-mode');
				// 	that.parentView.trigger('multi-change');
				// }

			} else {
				// select row
				$(elem).addClass('multi-selected');
			}

			return false;
		}

		// In Preview mode?
		if($(elem).hasClass('previewing')){
			// Call as if longtap were pressed again
			// alert('is previewing');
			that.preview_thread(ev);
			return false;
		}

		// - probably have some of the info cached already (all relevant headers)

		// Get Thread id
		var id = $(threadElem).attr('data-id');

		// Set last scroll position
		this.last_scroll_position = $('.threads_holder').scrollTop();
		this.$el.parents('.main_body').attr('last-scroll-position',this.last_scroll_position);

		// Launch view for that Thread
		Backbone.history.loadUrl('view_thread/' + id + '/undecided');

		return false;

	},

	render_ready: function(){
		var that = this;

		this.$el.removeClass('preloading');

		this.$el.attr('data-id', this.model.get('_id')); // fix, Thread._id
		this.$el.attr('data-thread-type', this.options.threadType);

		// Data for template
		// console.log(this.model.Email.toJSON());
		var data = {
			Thread: this.model.Full.toJSON(),
			Email: this.model.Email.toJSON(),
			threadType: this.threadType
		};

		// console.log(data);

		// Template
		var template = App.Utils.template('t_all_single_thread');

		// Write HTML
		this.$el.html(template(data));

		// Draggable
		if(usePg){

			this.$(".thread-preview").on('touchstart',App.Plugins.Minimail.thread_main.start);
			this.$(".thread-preview").on('touchmove',App.Plugins.Minimail.thread_main.move);
			this.$(".thread-preview").on('touchend',App.Plugins.Minimail.thread_main.end);
			
		} else {

			this.$(".thread-preview").on('mousedown',App.Plugins.Minimail.thread_main.start);
			this.$(".thread-preview").on('mousemove',App.Plugins.Minimail.thread_main.move);
			this.$(".thread-preview").on('mouseup',App.Plugins.Minimail.thread_main.end);
			
		}


		return this;
	}, 

	render: function(){
		// Render a "loading" thingy
		var that = this;

		var template = App.Utils.template('t_loading_common_thread');

		this.$el.addClass('preloading');
		this.$el.html(template());

		return this;


	}

});


App.Views.SubLeisureFilter = Backbone.View.extend({
	
	className: 'leisure_item no_text_select',

	events: {
	},

	initialize: function(options) {
		var that = this;
		_.bindAll(this, 'render');

		// Have model?
		if(!this.model){
			console.log('==Missing model');
		} else {
			// console.log('model OK');
		}

		// Set data-id attribute
		// this.$el.attr('data-id',this.model.get('_id'));

	},

	render: function(){
		var that = this;

		this.$el.attr('data-id', this.model.get('_id'));

		// Data for template
		var data = {
			LeisureFilter: this.model.Full.toJSON(),
			Threads: this.model.Threads.toJSON(),
			ThreadUnreadCount: this.model.ThreadUnreadCount
		};

		// console.info('leisure data');
		// console.log(data);

		// Template
		var template = App.Utils.template('t_leisure_item');

		// Write HTML
		this.$el.html(template(data));

		return this;
	}

});


App.Views.LeisureList = Backbone.View.extend({
	
	className: 'leisure_list_inside_view reverse_vertical',

	last_scroll_position: 0,

	events: {
		// 'click .save' : 'save',
		// 'click .preview' : 'preview'
		// 'click #back' : 'go_back',
		// 'click .sender' : 'approve',
		// 'click .sender_status a' : 'status_change'

		'click .leisure_item .filter_name' : 'open_leisure_preview',
		'click .leisure_item .item_threads' : 'view_leisure_category'

	},

	_subLeisureViews: [],
	initialize: function(options) {
		var that = this;
		_.bindAll(this, 'render');
		_.bindAll(this, 'refresh_and_render_list');

		// removal containers
		// - for when "refresh" is called
		this._waitingToRemove = [];

		// Create LeisureFilters Collection
		// - should this be Global?
		that.LeisureFilters = new App.Collections.LeisureFilters();
		that.LeisureFilters.on('reset', this.reset_filters, this); // completely changed collection (triggers add/remove)
		that.LeisureFilters.on('sync', this.sync_filters, this); // completely changed collection (triggers add/remove)
		that.LeisureFilters.on('add', this.add_filter, this); // added a new ThreadId
		// that.LeisureFilters.on('remove', this.remove_delayed_thread, delayContext); // removed a ThreadId
		that.LeisureFilters.on('change', function(filterchange){
			console.log('change_filters');
			console.log(filterchange);

		}, this);
		that.LeisureFilters.on('sort', this.sort_filters, this);
		// that.LeisureFilters.on('sync', function(sortchange){
		// 	console.log('sync_filters');
		// 	console.log(sortchange);

		// }, this);
		that.LeisureFilters.fetchList(); // trigger record retrieving


		// This'll run until it get's closed, so I guess it might update the cache in the background?
		that.cacheListener = Api.Event.on({
			event: ['Thread.action','Email.new']
		},function(result){
			console.warn('Refreshing LeisureList');
			// App.Utils.Notification.debug.temp('Fetching delayed, silently');
			window.setTimeout(function(){
				that.trigger('refresh');
			},3000); // wait 3 seconds before doing our .fetch
		});

		// Listen fo refresh
		this.on('refresh',this.refresh, this);


		// // CacheWatcher (listener)

		// // This'll run until it get's closed, so I guess it might update the cache in the background?
		// that.cacheListener = Api.Event.on({
		// 	event: ['Thread.action','Email.new']
		// },function(result){
		// 	console.warn('Fetching new because Thread.action or Email.new');
		// 	// App.Utils.Notification.debug.temp('Fetching delayed, silently');
		// 	that.delayedCollection.fetchDelayed();
		// 	that.undecidedCollection.fetchUndecided();
		// });

		// // Listen fo refresh
		// this.on('refresh',this.refresh, this);

	},

	close: function(){
		// Custom close function
		console.log('closing leisure');
	},

	refresh: function(){
		var that = this;
		// Asked to refresh the page
		// - clear any missing elements, add any that need to be added
		// - it should look nice while adding/removing! 

		that.LeisureFilters.fetchList();

		// go through "waiting_to_remove"
		_.each(this._waitingToRemove, function(elem, i){
			// Remove Thread's subView

			// Get subview to remove
			that._subLeisureViews[elem[0]] = _(that._subLeisureViews[elem[0]]).without(elem[1]);

			// Listen for transition end before removing the element entirely
			$(elem[1].el).bind("transitionend webkitTransitionEnd oTransitionEnd MSTransitionEnd", function(){
				$(elem[1].el).remove();
			});
			$(elem[1].el).addClass('closing_nicely');

		});

	},

	reset_filters: function(LeisureFilter){
		// Iterate over each
		console.log('reset_filters');

		// conduct 'add'
		that.LeisureFilters.each(this.add_filters, this);

	},

	sort_filters: function(LeisureFilters){
		var that = this;
		console.info('sort_filters');
		LeisureFilters.each(function(LeisureFilter){
			// See if it is in the correct place
			var current_view_index = -1;
			_.each(that._subLeisureViews, function(elem, i){
				if(elem.model == LeisureFilter){
					// console.log('foundview');
					current_view_index = i;
				}
			});	
			if(current_view_index == -1){
				// Unable to find, "add" will take care of it
				// console.warn('not in view');
				return;
			}

			// Get current index too
			var current_coll_index = LeisureFilters.indexOf(LeisureFilter);

			try {
				// Has the position of this view changed?
				if(current_view_index != current_coll_index){
					// Yes, it has changed position
					// - move it to the correct position in the list

					// changing one view might cause the other ones to fall into place correctly
					// - or it might fuck everything up
					//		- just do a simple re-render? (reset)

					// console.warn('changed position');
					// console.log(current_view_index);
					// console.log(current_coll_index);

					// get View
					var theView = that._subLeisureViews[current_view_index];

					// delete previous position
					that._subLeisureViews.splice(current_view_index,1); // only deleting the reference??

					// add it back to the view in the correct position
					that._subLeisureViews.splice(current_coll_index, 0, theView);

					// Render it in the correct spot in the page
					if(current_coll_index == 0){
						console.log('new index is zero');
					} else {
						// console.log('not zero');
						// console.dir(that.$('.all_threads').find('.leisure_item:nth-of-type('+ current_coll_index +')'));
						// console.dir(that.$('.all_threads').find('.leisure_item:nth-of-type('+ (current_coll_index + 1) +')'));
						// console.dir(that.$('.all_threads').find('.leisure_item:nth-of-type('+ (current_coll_index - 1) +')'));
						that.$('.all_threads').find('.leisure_item:nth-of-type('+ current_coll_index +')').after(theView.el);
					}

				} else {
					// console.log('no position change');
				}
			} catch(err){
				console.log(err);
			}
			
		} , this);
	},

	sync_filters: function(LeisureFilters){

	},

	add_filter: function(LeisureFilter){
		var that = this;

		LeisureFilter.Full = new App.Models.LeisureFilterFull({
			_id: LeisureFilter.toJSON()._id
		});

		// Listen for "change" event
		LeisureFilter.Full.on('change', function(filterFull){
			// Mark filter as ready to display
			// - this fires immediately if anything is cached
			// - otherwise it fires if something is different from the cached version
			if(!LeisureFilter.FullReady){
				LeisureFilter.FullReady = true;
				LeisureFilter.trigger('check_display_ready');
			}
		}, this);

		LeisureFilter.Full.fetchFull();


		LeisureFilter.on('check_display_ready', function(){

			// LeisureFilter is ready to be displayed

			// Must have Full ready
			if(!LeisureFilter.FullReady || !LeisureFilter.ThreadsReady){
				// console.warn('thread.check_display_ready = not ready');
				return;
			}
			// Already rendered this Thread?
			if(LeisureFilter.Rendered){
				// Show the change in the view
				console.warn('Already rendered (need to change the view!)');
				return;
			}
			LeisureFilter.Rendered = true;
			
			// Get UnreadCount

			// Only show 5 per Filter
			var unreadCount = 0;
			LeisureFilter.Threads.each(function(Thread){
				var tmpThread = Thread.toJSON();
				// console.log(tmpThread);
				try {
					if(tmpThread.attributes.read.status != 1){
						unreadCount += 1;
					}
				} catch(err){
					unreadCount += 1;
				}
			});

			LeisureFilter.ThreadUnreadCount = unreadCount;

			// Get intended index (position) of this LeisureFilter
			var idx = that.LeisureFilters.indexOf(LeisureFilter);

			// Create the View
			var dv = new App.Views.SubLeisureFilter({
				model : LeisureFilter,
				idx_in_collection: idx
			});

			// Add to views
			that._subLeisureViews.push(dv);

			// Re-sort the views we have
			that._subLeisureViews = _.sortBy(that._subLeisureViews,function(sV){
				return sV.options.idx_in_collection;
			});

			// Figure out the index of this view
			var filter_idx = that._subLeisureViews.indexOf(dv);
			// console.warn('thread_idx: ' + thread.Full.toJSON().original.subject);
			// console.log(thread_idx);
			// console.dir(that._subViews[this.threadType]);

			// Render this fucker in the correct place meow

			// If the view has been rendered, then immediately append views
			if(that._rendered){
				// Insert it into the correct place

				// // What is already displayed?
				// // - we are going to .before it to the correct elements (or .append to .all_threads if none are showing yet)
				// if(_.size(that._subLeisureViews) != 1){
				// 	// Already displayed at least one, so we need to figure out where this view is going

				// 	that.$('.all_threads').find('.thread:nth-of-type('+filter_idx+')').after(dv.render().el);

				// } else {
				// 	// No other ones, just prepend it (highest on the list)
				// 	// console.info('no other ones');

				// 	// Is the structure already set up?
				// 	if(!that.$('.all_threads').length){
				// 		console.log('rendering structure');
				// 		that.render_structure();
				// 	}

				// 	// At the bottom
				// 	that.$('.all_threads').append(dv.render().el);
				// }

				// Is the structure already set up?
				if(!that.$('.all_threads').length){
					console.log('rendering structure');
					that.render_structure();
				}

				// At the bottom (fuck it)
				that.$('.all_threads').append(dv.render().el);

				// Resize the scrollable part (.all_threads)
				that.resize_fluid_page_elements();
				that.resize_scroller();

				// Scroll to bottom
				that.$('.scroller').scrollTop(10000);

			}

			// // And add it to the collection so that it's easy to reuse.
			// that._subViews[this.threadType].push(dv);

			// done
			// console.info('Rendered Thread (complete w/ emails)');

		}, this);

		// // Listen for "change" event
		// LeisureFilter.Full.on('change', function(threadFull){
		// 	// Mark thread as ready
		// 	// - this fires immediately if anything is cached
		// 	// - otherwise it fires if something is different from the cached version
		// 	if(!thread.FullReady){
		// 		thread.FullReady = true;
		// 		thread.trigger('check_display_ready');
		// 	}
		// }, this);

		// Emails for Thread
		// - we want to know after all the emails have been loaded for the Thread
		LeisureFilter.Threads = new App.Collections.LeisureThreads();

		LeisureFilter.Threads.on('reset', function(Threads){
			if(!LeisureFilter.ThreadsReady){
				LeisureFilter.ThreadsReady = true;
				LeisureFilter.trigger('check_display_ready');
			}
		}, this); // completely changed collection (triggers add/remove)

		LeisureFilter.Threads.on('sync', function(threadFull){
			// Fires after add/remove have completed?
			// console.info('EmailSync');
			if(!LeisureFilter.ThreadsReady){
				LeisureFilter.ThreadsReady = true;
				LeisureFilter.trigger('check_display_ready');
			}
		}, this); // completely changed collection (triggers add/remove)

		LeisureFilter.Threads.on('add', function(emailFullModel){
			// console.log('EmailAdd');
			// console.log(emailFullModel.toJSON()._id);
		}, this); // added a new EmailFull

		LeisureFilter.Threads.on('remove', function(emailFullModel){
			// console.log('EmailRemove');
			// console.log(emailFullModel.get('id'));
		}, this); // remove a new EmailFull
		
		LeisureFilter.Threads.on('change', function(emailFullModel){
			console.log('EmailChange');
		}, this); // an email is slightly different now (re-render)
		
		// trigger EmailFull collection retrieving
		// console.info(LeisureFilter.get('_id'));
		LeisureFilter.Threads.fetchAll({
			ids: [LeisureFilter.get('_id')],
			// cachePrefix: LeisureFilter.get('_id')
		});

	},

	open_leisure_preview: function(ev){
		// Show/hide threads for this filter

		var that = this;
		var elem = ev.currentTarget;
		var threadElem = $(elem).parents('.leisure_item');

		if($(threadElem).find('.item_threads').hasClass('nodisplay')){
			// Show threads
			$(threadElem).find('.item_threads').removeClass('nodisplay')
		} else {
			// Hide threads
			$(threadElem).find('.item_threads').addClass('nodisplay')
		}

		return false;

	},


	view_leisure_category: function(ev){
		// View an individual email
		var elem = ev.currentTarget;
		var threadElem = $(elem).parents('.leisure_item');
		
		// - probably have some of the info cached already (all relevant headers)

		// Get Thread id
		var id = $(threadElem).attr('data-id');

		// Set last scroll position
		this.last_scroll_position = $('.all_threads').scrollTop();
		this.$el.parents('.main_body').attr('last-scroll-position',this.last_scroll_position);

		// Launch view for that Thread
		Backbone.history.loadUrl('view_leisure_thread/' + id);

		return false;

	},


	render_init: function(){
		// Render the loading screen
		var that = this;

		// Template
		var template = App.Utils.template('t_leisure_init');

		// Write HTML
		this.$el.html(template());

		return this;

	},

	render_structure: function(){

		// Render the loading screen
		var that = this;

		// Template
		var template = App.Utils.template('t_leisure_structure');

		// Write HTML
		this.$el.html(template());

		return this;
	},

	render_list: function(lfilters){

		// Only show 5 per Filter
		$.each(lfilters,function(i,v){
			lfilters[i].ThreadUnreadCount = 0;

			// Get unread count
			
			$.each(v.Thread,function(k,Thread){
				try {
					if(Thread.attributes.read.status != 1){
						lfilters[i].ThreadUnreadCount += 1;
					}
				} catch(err){
					lfilters[i].ThreadUnreadCount += 1;
				}
			});

			// Only include 5 in the showing (will show 5+)
			if(v.Thread.length > 5){
				v.Thread = v.Thread.splice(0,5);
			}
			lfilters[i] = v;
		});

		// Render the loading screen
		var that = this;

		// Template
		var template = App.Utils.template('t_leisure');

		// Write HTML
		this.$el.html(template(lfilters));

		// // Change size of window based on display size
		// $('.leisure_list_inside_view').css({
		// 	height: App.Data.xy.win_height - 60 // 120 w/ footer
		// 	// width: App.Data.xy.win_width
		// });

		// $('.all_threads').css({
		// 	"max-height": App.Data.xy.win_height - 60,
		// 	width: App.Data.xy.win_width
		// });

		// Resize the scrollable part (.all_threads)
		this.resize_fluid_page_elements();
		this.resize_scroller();

		// $('.leisure_list').css({
		// 	"max-height": $(window).height() - 60,
		// 	width: App.Data.xy.win_width
		// });

		// // Scroll to bottom
		// $('.all_threads').scrollTop($(document).height() + 1000); // very bottom
		this.$('.scroller').scrollTop(10000);

		// // Draggable
		// $(".thread-preview").on('touchstart',App.Plugins.Minimail.thread_main.start);
		// // $(".thread-preview").on('mousedown',App.Plugins.Minimail.thread_main.start);
		// $(".thread-preview").on('touchmove',App.Plugins.Minimail.thread_main.move);
		// // $(".thread-preview").on('mousemove',App.Plugins.Minimail.thread_main.move);
		// $(".thread-preview").on('touchend',App.Plugins.Minimail.thread_main.end);
		// // $(".thread-preview").on('mouseup',App.Plugins.Minimail.thread_main.end);

		return this;
		
	},


	refresh_and_render_list: function(){
		// Refresh the Thread list from the server
		// - re-render the Threads (this.render_threads)

		var that =  this;

		// that.LeisureFilterCollection = new App.Collections.LeisureFilters();
		// that.LeisureFilterCollection.fetchAll({
		// 	success: function(leisure_list) {
		// 		// Does not return models, just JSON data objects
		// 		// clog('back with result');
				
		// 		// Store locally
		// 		App.Utils.Storage.set('leisure_list_top',leisure_list);

		// 		// Render new Thread list
		// 		that.render_list(leisure_list);
		// 	}
		// });


	},

	render: function() {
		var that = this;

		if(this._rendered){
			// Already rendered
			// - re-displaying this View
			this._rendered = true;

			// Re-delegate events
			this.delegateEvents();

			// events for subviews
			_(that._subLeisureViews).each(function(v) {
				v.delegateEvents();
			});

		} else {
			this._rendered = true;

			// Render initial body
			this.render_init();

			// Render the views

			// Leisure things
			_(that._subLeisureViews).each(function(uv) {
				that.$('.all_threads').append(uv.render().el);
			});
		}

		// Resize the scrollable part (.all_threads)
		this.resize_fluid_page_elements();
		this.resize_scroller();

		// Scroll to bottom
		this.$('.scroller').scrollTop(10000);





		// // Refresh and render
		// // this.refresh_and_render_threads();

		// // Get stored leisure_list
		// App.Utils.Storage.get('leisure_list_top')
		// 	.then(function(threads){

		// 		if(threads != null){
		// 			// Have some local data
		// 			// Trigger a refresh of the data
		// 			// - when the data is refreshed, the view gets refreshed as well
					
		// 			that.render_list(threads);

		// 		}

		// 		that.refresh_and_render_list();

		// 	});

		// How old is it?
		// Do we need to do a refresh?

		// View is based on what data we do have, and a view makes sure the new data is being found? 

		return this;
	}
});

App.Views.LeisureItem = Backbone.View.extend({
	
	className: 'leisure_item_view',

	events: {
		'click .btn[data-action="back"]' : 'go_back'

		// 'click .btn[data-action="delay"]' : 'click_delay',
		// 'click .btn[data-action="done"]' : 'click_done',
		// 'click .btn[data-action="pin"]' : 'click_pin',

		// 'click .reply' : 'reply',
		// 'click .forward' : 'forward',

		// 'click .email_holder .email_body .ParsedDataShowAll span.expander' : 'email_folding',
		// 'click .email_holder .email_body .ParsedDataShowAll span.edit' : 'edit_email'
	},

	initialize: function(options) {
		_.bindAll(this, 'render');
		_.bindAll(this, 'beforeClose');
		_.bindAll(this, 'go_back');
		// _.bindAll(this, 'email_sent');
		// _.bindAll(this, 'refresh_and_render_thread');
		var that = this;
		// this.el = this.options.el;

		// Get any local information we have
		// After getting local info, and if we have enough, show the thing
		// Get remote info, merge with Local when it arrives

		// Render the information we have on this Thread
		this.leisureid = this.options.leisureid

		// Event bindings
		// - also bound at the top of initialize
		// App.Events.bind('email_sent',this.email_sent);
		// App.Events.bind('thread_updated',this.refresh_and_render_thread);




		// Get the data that we do have for the thing
		// - re-render after we get the whole thing! 
		// App.Utils.Storage.

		// Get the data difference from what we have
		// - diff and patch
		// - already know the fields we would have requested (that doesn't change at all?)


		// // Render the base view
		// var thread_cached = false;
		// if(thread_cached){
		// 	// Thread is in memory
		// 	// - display base view including Thread
		// 	// - todo...
		// } else {
		// 	// No Thread in memory

		// 	// Display base outline
		// 	// Fetch Thread and Emails for thread

		// 	App.Plugins.Minimail.getThreadAndEmails(this.options.threadid)
		// 		.then(function(returnThread){
		// 			that.render_content(returnThread);
		// 		})
		// 		.fail(function(err){
		// 			clog('Failed getThreadAndEmails');
		// 			clog(err);
		// 		});


		// }

	},

	beforeClose: function(){
		// Kill back button grabber
		var that = this;

		App.Utils.BackButton.debubble(this.backbuttonBind);

		return;
	},

	set_scroll_position: function(){
		var that = this;

		// Set last scroll position
		this.last_scroll_position = this.$el.scrollTop();
		this.$el.attr('last-scroll-position',this.last_scroll_position);

		// clog('.' + this.className);
		// clog(this.last_scroll_position);

	},

	go_back: function(ev){
		// Going back to mailbox
		// - highlight the correct row we were on? (v2)

		// Is there some way of referencing the Backbone view instead of using jquery? 

		// Re-show .main_body
		$('.main_body').removeClass('nodisplay');

		// Scroll to correct position
		var scrollTo = 0;
		if($('.main_body').attr('last-scroll-position')){
			scrollTo = $('.main_body').attr('last-scroll-position');
		}
		$('.all_threads').scrollTop(scrollTo);

		// Close myself
		this.close();

		return false;
	},


	render_loading: function(){
		// Should show a loading screen

	},

	render_filter: function(){
		
		clog('rendering Filter');

		// Render the loading screen
		var that = this;

		// Template
		var template = App.Utils.template('t_leisure_item_view');

		// Get the Threads and Emails

		// build the data
		var data = {
			AppMinimailLeisureFilter: App.Data.Store.AppMinimailLeisureFilter[that.leisureid],
			// Thread: App.Data.Store.Thread[this.threadid],
			Threads: _.filter( App.Data.Store.Thread,function(thread){
					var found = false;
					try {
						$.each(thread.app.AppPkgDevMinimail.leisure_filters,function(i,v){
							if(v._id == that.leisureid){
								found = true;
							}
						});
					} catch(err){
						found = false;
					}
					if(found) return true;
				})
		};

		// Get Emails for Threads
		var thread_ids = [];
		data.Threads = _.map(data.Threads,function(thread){

			var thread_id = thread._id;
			thread_ids.push(thread._id);

			return {
				Thread: thread,
				Email: _.filter( App.Data.Store.Email,function(email){
						if(email.attributes.thread_id == thread_id) return true;
					})
			};
		});

		// Sort by recent Thread
		// - expecting singles anyways
		data.Threads = App.Utils.sortBy({
			arr: data.Threads,
			path: '[0].attributes.last_message_datetime',
			direction: 'asc',
			type: 'date'
		});

		// Mark Threads as Read
		clog('updating Threads');
		Api.update({
			data: {
				model: 'Thread',
				conditions: {
					'_id' : {
						"$in" : thread_ids
					}
				},
				paths: {
					"$set" : {
						'attributes.read.status' : 1
					}
				},
				limit: data.Threads.length
			},
			success: function(){
				// Yay updated
				// - should also update the local version first?
			}
		});

		clog(2);
		clog(data);

		// Write HTML
		this.$el.html(template(data));

		// Resize the scrollable part (.all_threads)
		this.resize_fluid_page_elements();
		this.resize_scroller();

		return this;
		
	},

	refresh_and_render_filter: function(){
		// Make sure we have all the up-to-date data for this LeisureFilter
		var that = this;

		// Shouldn't be creating a new Collection each time...
		// - whole Model/Collection/View sync and relationships concept is borked in my head anyways


		var tmp_threads = new App.Collections.Threads();
		tmp_threads.fetch_for_leisure({
			leisure_id: that.leisureid,
			success: function(thread_models_collection){
				// Anything different from the existing look?
				// - update the View with new data
				
				var thread_models = thread_models_collection.toJSON();

				// Get thread ids
				var thread_ids = _.map(thread_models,function(thread_model){
					return thread_model._id;
				});

				// Get Emails for each of the threads
				var tmp_emails = new App.Collections.Emails();

				tmp_emails.fetch_by_id_full({
					ids: thread_ids,
					success: function(emails){
						// Anything different from the existing look?
						// - update the View with new data
						
						clog('re-rendering Filter');
						that.render_filter();

					}
				});

			}
		});


	},

	render: function() {
		var that = this;



		// Render initial/loading body
		// this.render_init();

		// Do we already have some data?
		// - we MUST already have some data, especially if we just loaded Threads a second ago
		// - unless we get here unexpectedly, in which case a "loading" screen should be shown
		// - maybe we just viewed this Thread, so we have it cached! 

		var data = App.Data.Store.AppMinimailLeisureFilter[this.leisureid];
		if(data == undefined){
			// Thread not set at all
			that.refresh_and_render_filter();

			// Shouldn't not be set at all
			// - show a total loading screen (loading Thread and Emails)
			// - todo...


			return false;
		} else {
			// We have some Thread data
			// probably some Email data for that Thread too

			// Display everything we have for the Thread and Emails

			// Check the API for any updates to the data that we have
			// - see if the version are different
			// - if versions are different than, don't worry about it because we're only updating the data we care about here

			// conditions: {
			// 	_modified : {
			// 		"$ne" : previous_modified_version
			// 	}
			// }

			// Get all the Emails for that Thread
			// - more than likely this barely changes (or maybe has a single new Email)
			// - I should already have the relationship in here

			// I already retrieved some of the emails beforehand
			// - I should have all the Email models at least in memory
			// - the ajax request is an "in case I fucked up and data has changed" type of request

			// var emails = _.filter( App.Data.Store.Email,function(email){
			// 	if(email.attributes.thread_id == that.threadid) return true;
			// });
			
			that.render_filter();

			// Have a partial list of emails, and a partial list of Threads
			// - render both
			// - trigger the updater to run

			that.refresh_and_render_filter();

		}

		this.backbuttonBind = App.Utils.BackButton.newEnforcer(this.go_back);

		return this;

	}

});


App.Views.Search = Backbone.View.extend({
	
	className: 'search_inside_view reverse_vertical',

	last_scroll_position: 0,

	events: {
		// 'click .save' : 'save',
		// 'click .preview' : 'preview'
		// 'click #back' : 'go_back',
		// 'click .sender' : 'approve',
		// 'click .sender_status a' : 'status_change'

		// 'click .thread-preview' : 'view_email'

		'click .search_category' : 'open_cat',
		'click .detail_item' : 'search_quick'

	},

	initialize: function(options) {
		var that = this;
		_.bindAll(this, 'render');

	},

	open_cat: function(ev){
		// Load correct view

		var that = this;
		var elem = ev.currentTarget;

		// threads, contacts, links, attachments
		switch($(elem).attr('data-type')){

			case 'threads':
				Backbone.history.loadUrl('search_emails');
				break;

			case 'contacts':
				Backbone.history.loadUrl('search_contacts');
				break;

			case 'attachments':
				Backbone.history.loadUrl('search_attachments');
				break;

			case 'links':
				Backbone.history.loadUrl('search_links');
				break;

			default:
				alert('failed finding type');
				return false;
		}

		return false;

	},

	search_quick: function(ev){
		// Running a quick search
		// - searching everything basically
		// - return contact matches, etc.

		alert('quick search off');
		return;

		var that = this;
		var elem = ev.currentTarget;

		var $search_category = $(elem).parents('.search_category');

		// Determine action based on which is clicked

		// $search_category

	},


	refresh_data: function(){
		// Refresh the data for the view

	},


	render_init: function(){
		// Render the loading screen
		var that = this;

		// Template
		var template = App.Utils.template('t_search');

		// Write HTML
		this.$el.html(template());

		// Change size of window based on display size
		// $('.search_inside_view').css({
		// 	height: App.Data.xy.win_height - (60), // footer height = 60
		// 	width: App.Data.xy.win_width
		// });
		// $('.quick_searches').css({
		// 	"max-height": App.Data.xy.win_height - (60),  // footer height = 60
		// 	width: App.Data.xy.win_width
		// });
		// $('.search_inside .search_category:first-child').css({
		// 	"margin-top" : App.Data.xy.win_height - (60+75)
		// });
		
		// Focus on search box
		// this.$('input').focus();

		// Scroll down
		// $('.quick_searches').scrollTop($('.quick_searches').height());

		// Resize windows and scroller panes accordingly
		this.resize_fluid_page_elements();
		this.resize_scroller();

		// scroll to bottom
		this.$('.scroller').scrollTop(10000);

		return this;

	},

	render: function() {
		var that = this;

		// Render initial body
		this.render_init();



		// How old is it?
		// Do we need to do a refresh?

		// View is based on what data we do have, and a view makes sure the new data is being found? 




		return this;
	}
});


App.Views.SearchEmails = Backbone.View.extend({
	
	className: 'search_emails_inside_view reverse_vertical',

	last_scroll_position: 0,

	// Pre-filtered options
	filter_options: [
		// {
		// 	name: 'Search',
		// 	key: 'search'
		// },
		{
			name: 'Recently Viewed',
			key: 'recently_viewed'
		},
		{
			name: 'Recently Acted On',
			key: 'recently_acted_on'
		},
		{
			name: 'Sent',
			key: 'sent'
		}
	],

	// List fields to search (regex searching)
	filter_fields: [
		'original.TextBody',
		'original.HtmlBody',
		'original.HtmlTextSearchable', // - strip html (for searching HTML views)
		'original.headers.Subject',
		'original.headers.From',
		'original.headers.To',
		'original.headers.Reply-To',
		'original.attachments.name' // array
		], 

	events: {
		// 'click .save' : 'save',
		// 'click .preview' : 'preview'
		// 'click #back' : 'go_back',
		// 'click .sender' : 'approve',
		// 'click .sender_status a' : 'status_change'

		// 'click .thread-preview' : 'view_email'

		'change .prefilters_select' : 'click_prefilter',
		'click .form-search .submit' : 'search',
		'click .show_search' : 'show_search',
		'click .form-search .cancel' : 'hide_search',

		'click .thread' : 'view_thread'


	},

	initialize: function(options) {
		var that = this;
		_.bindAll(this, 'render');
		_.bindAll(this, 'render_loading_threads');

		_.bindAll(this, 'recently_viewed');
		_.bindAll(this, 'recently_acted_on');
		_.bindAll(this, 'sent_emails');

		_.bindAll(this, 'show_search');
		_.bindAll(this, 'hide_search');

	},

	click_prefilter : function(ev, elem2){
		// What are we filtering by?
		var that = this;
			
		var elem;
		if(elem2){
			elem = elem2;
		} else {
			elem = ev.currentTarget;
		}

		// Get selected element
		$(elem).blur();

		var elem_key = $(elem).find(':selected').val();

		// // de-active other filters
		// that.$('.prefilter').removeClass('active');

		// // mark this filter as active
		// $(elem).addClass('active');

		// re-search based on this new filter
		// - cache searches?
		// - use diff patching

		// Get type to search on
		// var elem_key = $(elem).attr('data-action');
		var type = _.filter(that.filter_options,function(opt){
			if(opt.key == elem_key){
				return true;
			}
		});
		if(type.length != 1){
			clog('failed');
			return false;
		}
		type = type[0];

		// Search using these conditions
		// - or not conditions, depends
		switch(type.key){

			case 'search': 
				that.show_search();
				break;

			case 'recently_viewed':
				// Uses info from local datastore
				that.recently_viewed();
				break;

			case 'recently_acted_on':
				// Uses info from local datastore
				that.recently_acted_on();
				break;

			case 'sent':
				// Sent emails
				that.sent_emails();
				break;

		}
		


		return false;
	},


	show_search: function(){
		// Show the search options
		var that = this;

		// hide search input
		that.$('.form-search').removeClass('nodisplay');

		// show select box
		that.$('.search_prefilters').addClass('nodisplay');

		// Focus on search box
		that.$('.form-search input[type="text"]').focus();

		// Display waiting icon
		that.render_waiting_for_search();

	},


	hide_search: function(){
		// Show the search options
		var that = this;

		// hide search input
		that.$('.form-search').addClass('nodisplay');

		// show select box
		that.$('.search_prefilters').removeClass('nodisplay');

		// switch select box to 2nd option
		that.$('select').val('recently_viewed');
		that.$('select').trigger('change');

		// clear the search box?

		return false;

	},

	_searchEmailSubViews: [],
	search: function(ev){
		// Search was clicked
		var that = this;

		// Get search input (if any)
		var search_input = that.$('input.search-query').val();
		search_input = $.trim(search_input);

		if(search_input.length < 1){
			alert('Please search for something!');
			return false;
		}

		// Display loading icon
		that.render_loading_threads();

		// Clear views (if any exist)
		if(that._searchEmailSubViews.length > 0){
			_.each(that._searchEmailSubViews, function(tmpView){
				tmpView.close();
			});
		}
		that._searchEmailSubViews =[];

		// Get those threads and display them?
		// - not checking cache at all?
		var EmailSearches = new App.Collections.EmailSearches();
		EmailSearches.fetch_for_search({
			text: search_input, // handles: AND, OR, has:attachment, etc.
		});

		// Handle search results and getting the actual emails
		var EmailSearchesAdd = function(EmailObj){
			// Get the EmailFull
			// - checks cache too

			// Render the view in the correct place (append)
			// - contains a "nodisplay" until the Model arrives

			// Remove "loading" if it is there?

			// Get index (position) of this item
			var idx = EmailSearches.indexOf(EmailObj);

			// Create the View
			var dv = new App.Views.SubSearchesEmail({
				model : EmailObj,
				idx_in_collection: idx,
				fadein: false
			});

			// Add to this subView tracker
			that._searchEmailSubViews.push(dv);

			// Re-sort the views we have
			that._searchEmailSubViews = _.sortBy(that._searchEmailSubViews,function(sV){
				return sV.options.idx_in_collection;
			});

			// Figure out the index of this view
			var elem_idx = that._searchEmailSubViews.indexOf(dv);
			
			// Remove the loading page, if it exists
			that.$('.loading').remove();

			var $tmpElem = that.$('.search_emails_thread_results ').find('.thread:nth-of-type('+elem_idx+')');

			if(_.size(that._searchEmailSubViews) != 1 && $tmpElem.length){
				// Not the first view
				// console.info(elem_idx);
				// console.info(that.$('.search_emails_thread_results ').find('.thread:nth-of-type('+elem_idx+')'));
				$tmpElem.after(dv.render().el);
				// that.$('.all_threads').find('.thread[data-thread-type="'+this.threadType+'"]:nth-of-type('+thread_idx+')').after(dv.render().el);
			} else {
				// First view, append it to the page

				// Render
				that.$('.search_emails_thread_results').append(dv.render().el);
			}

			// console.log('EmailObj');
			// console.log(EmailObj.toJSON());

			// Create new Model for EmailFull
			EmailObj.EmailFull = new App.Models.EmailFull({
				_id: EmailObj.toJSON()['_id'],
				id: EmailObj.toJSON()['_id']
			});

			// Wait for EmailFull to be populated ("change" is fired?)
			EmailObj.EmailFull.on('change',function(EmailFull){
				// Got the EmailFull
				// console.log('Got EmailFull');
				// console.log(EmailFull);
				// console.log(EmailFull.toJSON());

				// Render this EmailObj Views
				// - already rendered, just need to remove the "nodisplay" from the view
				dv.trigger('render_full');

				// Scroll to bottom
				that.$('.scroller').scrollTop(10000);

			}, this);

			// console.log('pre-fetch');
			// console.log(EmailObj.EmailFull.toJSON());
			EmailObj.EmailFull.fetchFull();

		};

		// Handle search results and getting the actual emails
		EmailSearches.on('reset',function(EmailSearches){
			// Only called once

			console.warn('reset');
			// that.$('.search_emails_thread_results').html();

			// Iterate over "add"
			EmailSearches.each(EmailSearchesAdd, this);
		}, this);


		// Handle search results and getting the actual emails
		EmailSearches.on('sync',function(EmailSearches){
			// Order has probably changed
			// - fires when changes come back from the API

		}, this);

		EmailSearches.on('add', EmailSearchesAdd, this);

		// 	success: function(emails){

		// 		// Returns a list of Emails
		// 		// - use those for the display
		// 		emails = emails.toJSON();

		// 		// Merge together by Thread?
		// 		// - todo...

		// 		// Sort by date
		// 		emails = App.Utils.sortBy({
		// 			arr: emails,
		// 			path: 'common.date',
		// 			direction: 'desc',
		// 			type: 'date'
		// 		});

		// 		// Template
		// 		var template = App.Utils.template('t_search_emails_email_results');

		// 		// Write HTML
		// 		that.$('.search_emails_thread_results').html(template(emails));

		// 		// Scroll to bottom
		// 		$('.search_emails_thread_results').scrollTop($('.search_emails_thread_results').height() + 1000);

		// 	}
		// });

		return false;
	},


	recently_viewed: function(){
		// Renders recently viewed threads
		var that = this;

		// Display loading icon
		that.render_loading_threads();

		// Get thread ids (local)
		var thread_ids = $.extend([],App.Data.Store.ThreadsRecentlyViewed);

		// Limit to 10 results
		var super_recent = thread_ids.splice(0,10);

		// Get those threads and display them?
		// - not checking cache at all?
		var ThreadCollection = new App.Collections.Threads();
		ThreadCollection.fetch_by_ids_with_email({
			thread_ids: super_recent,
			success: function(threads){

				// Template
				var template = App.Utils.template('t_search_emails_thread_results');

				// Write HTML
				that.$('.search_emails_thread_results').html(template(threads));

				// Scroll to bottom
				that.$('.scroller').scrollTop(10000);

			}
		});


		// Change size of window based on display size
		that.scroll_to_bottom();

	},


	recently_acted_on: function(){
		// Renders recently viewed threads
		var that = this;

		// Display loading icon
		that.render_loading_threads();

		// Get thread ids (local)
		var thread_ids = $.extend([],App.Data.Store.ThreadsRecentlyActedOn);

		// Limit to 10 results
		var super_recent = thread_ids.splice(0,10);

		// Get those threads and display them?
		// - not checking cache at all?
		var ThreadCollection = new App.Collections.Threads();
		ThreadCollection.fetch_by_ids_with_email({
			thread_ids: super_recent,
			success: function(threads){

				// Template
				var template = App.Utils.template('t_search_emails_thread_results');

				// Write HTML
				that.$('.search_emails_thread_results').html(template(threads));

				// Scroll to bottom
				that.$('.scroller').scrollTop(10000);
			}
		});


	},

	sent_emails: function(){
		// Renders recently viewed threads
		var that = this;

		// Display loading icon
		that.render_loading_threads();

		// Clear views (if any exist)
		if(that._searchEmailSubViews.length > 0){
			_.each(that._searchEmailSubViews, function(tmpView){
				tmpView.close();
			});
		}
		that._searchEmailSubViews =[];

		// Get those threads and display them?
		// - not checking cache at all?
		var EmailSearches = new App.Collections.EmailSearches();
		EmailSearches.fetch_sent();

		// Handle search results and getting the actual emails
		var EmailSearchesAdd = function(EmailObj){
			// Get the EmailFull
			// - checks cache too

			// Render the view in the correct place (append)
			// - contains a "nodisplay" until the Model arrives

			// Remove "loading" if it is there?

			// Get index (position) of this item
			var idx = EmailSearches.indexOf(EmailObj);

			// Create the View
			var dv = new App.Views.SubSearchesEmail({
				model : EmailObj,
				idx_in_collection: idx,
				fadein: false
			});

			// Add to this subView tracker
			that._searchEmailSubViews.push(dv);

			// Re-sort the views we have
			that._searchEmailSubViews = _.sortBy(that._searchEmailSubViews,function(sV){
				return sV.options.idx_in_collection;
			});

			// Figure out the index of this view
			var elem_idx = that._searchEmailSubViews.indexOf(dv);
			
			// Remove the loading page, if it exists
			that.$('.loading').remove();

			var $tmpElem = that.$('.search_emails_thread_results ').find('.thread:nth-of-type('+elem_idx+')');

			if(_.size(that._searchEmailSubViews) != 1 && $tmpElem.length){
				// Not the first view
				// console.info(elem_idx);
				// console.info(that.$('.search_emails_thread_results ').find('.thread:nth-of-type('+elem_idx+')'));
				$tmpElem.after(dv.render().el);
				// that.$('.all_threads').find('.thread[data-thread-type="'+this.threadType+'"]:nth-of-type('+thread_idx+')').after(dv.render().el);
			} else {
				// First view, append it to the page

				// Render
				that.$('.search_emails_thread_results').append(dv.render().el);
			}

			// Create new Model for EmailFull
			EmailObj.EmailFull = new App.Models.EmailFull({
				_id: EmailObj.toJSON()['_id'],
				id: EmailObj.toJSON()['_id']
			});

			// Wait for EmailFull to be populated ("change" is fired?)
			EmailObj.EmailFull.on('change',function(EmailFull){
				// Got the EmailFull

				// Trigger full rendering
				dv.trigger('render_full');

				// Scroll to bottom
				that.$('.scroller').scrollTop(10000);

			}, this);

			// Fetch Full Email
			EmailObj.EmailFull.fetchFull();

		};

		// Handle search results and getting the actual emails
		EmailSearches.on('reset',function(EmailSearches){
			// Only called once

			console.warn('reset');
			// that.$('.search_emails_thread_results').html();

			// Iterate over "add"
			EmailSearches.each(EmailSearchesAdd, this);
		}, this);


		// Handle search results and getting the actual emails
		EmailSearches.on('sync',function(EmailSearches){
			// Order has probably changed
			// - fires when changes come back from the API

		}, this);

		EmailSearches.on('add', EmailSearchesAdd, this);

		return false;
	},

	view_thread: function(ev){
		// Show a thread
		var that = this;
		var elem = ev.currentTarget;

		// Get Thread id
		var id = $(elem).attr('data-id');

		// Set last scroll position
		this.last_scroll_position = $('.threads_holder').scrollTop();
		this.$el.parents('.main_body').attr('last-scroll-position',this.last_scroll_position);

		// Launch view for that Thread
		Backbone.history.loadUrl('view_thread/' + id + '/searching');

	},

	scroll_to_bottom: function(){

		// // Change size of window based on display size
		// $('.search_emails_thread_results').css({
		// 	height: App.Data.xy.win_height - (60 + 50), // footer height = 60. search_footer height = 50. critera height = 50
		// 	width: App.Data.xy.win_width
		// });
		// $('.search_emails_thread_results').css({
		// 	"max-height": App.Data.xy.win_height - (60 + 50),  // footer height = 60. search_footer height = 50. critera height = 50
		// 	width: App.Data.xy.win_width
		// });
		// $('.search_emails_thread_results .search_result:first-child').css({
		// 	"margin-top" : App.Data.xy.win_height - (60+75) // 75?
		// });
	
		return;

	},


	render_init: function(){
		// Render the loading screen
		var that = this;

		// Template
		var template = App.Utils.template('t_search_emails');

		// Write HTML
		this.$el.html(template({
			filter_options: that.filter_options
		}));

		// Resize the scroller
		this.resize_fluid_page_elements();
		this.resize_scroller();

		// that.$('select').trigger('change');
		// that.$('select').blur();

		// Enable mobiscroll select (modal is cleanest)
		that.$('.prefilters_select').mobiscroll().select({
			theme: 'android-ics',
			display: 'bubble',
			mode: 'mixed',
			inputClass: 'prefilters_select'
		});

		// Choose Recent
		that.$('select').val('recently_viewed');
		this.click_prefilter(null, that.$('select'));

		return this;

	},

	render_loading_threads: function(){
		var that = this;

		// Template
		var template = App.Utils.template('t_search_thread_results_loading');

		// Write HTML
		that.$('.search_emails_thread_results').html(template());

	},

	render_waiting_for_search: function(){
		var that = this;

		// Template
		var template = App.Utils.template('t_search_waiting_for_input');

		// Write HTML
		that.$('.search_emails_thread_results').html(template());

	},

	render: function() {
		var that = this;

		// Render initial body
		this.render_init();

		// How old is it?
		// Do we need to do a refresh?

		// View is based on what data we do have, and a view makes sure the new data is being found? 

		return this;
	}
});


App.Views.SearchAttachments = Backbone.View.extend({
	
	className: 'search_emails_inside_view',

	last_scroll_position: 0,

	// Pre-filtered options
	filter_options: [
		// {
		// 	name: 'Search',
		// 	key: 'search'
		// },
		{
			name: 'Recent',
			key: 'recent'
		},
		{
			name: 'Received',
			key: 'received'
		},
		{
			name: 'Sent',
			key: 'sent'
		}
	],

	events: {

		'change .prefilters_select' : 'click_prefilter',
		'click .form-search .submit' : 'search',
		'click .show_search' : 'show_search',
		'click .form-search .cancel' : 'hide_search',

		'click .attachment' : 'view_attachment'

		// 'click .thread' : 'view_thread'

	},

	initialize: function(options) {
		var that = this;
		_.bindAll(this, 'render');
		_.bindAll(this, 'render_loading_threads');

		// _.bindAll(this, 'recently_viewed');
		// _.bindAll(this, 'recently_acted_on');
		// _.bindAll(this, 'sent_emails');

		_.bindAll(this, 'show_search');
		_.bindAll(this, 'hide_search');

	},

	click_prefilter : function(ev){
		// What are we filtering by?
		var that = this;
		var elem = ev.currentTarget;

		// Get selected element

		$(elem).blur();

		var elem_key = $(elem).find(':selected').val();

		// // de-active other filters
		// that.$('.prefilter').removeClass('active');

		// // mark this filter as active
		// $(elem).addClass('active');

		// re-search based on this new filter
		// - cache searches?
		// - use diff patching

		// Get type to search on
		// var elem_key = $(elem).attr('data-action');
		var type = _.filter(that.filter_options,function(opt){
			if(opt.key == elem_key){
				return true;
			}
		});
		if(type.length != 1){
			clog('failed');
			return false;
		}
		type = type[0];

		// Search using these conditions
		// - or not conditions, depends
		switch(type.key){

			case 'recent':
				// Uses info from local datastore
				that.recent_attachments();
				break;

			case 'received':
				// Uses info from local datastore
				that.received_attachments();
				break;

			case 'sent':
				// Sent attachments
				that.sent_attachments();
				break;

		}
		


		return false;
	},


	show_search: function(){
		// Show the search options
		var that = this;

		// hide search input
		that.$('.form-search').removeClass('nodisplay');

		// show select box
		that.$('.search_prefilters').addClass('nodisplay');

		// Focus on search box
		that.$('.form-search input[type="text"]').focus();

		// Display waiting icon
		that.render_waiting_for_search();

	},


	hide_search: function(){
		// Show the search options
		var that = this;

		// hide search input
		that.$('.form-search').addClass('nodisplay');

		// show select box
		that.$('.search_prefilters').removeClass('nodisplay');

		// switch select box to 2nd option
		that.$('select').val('recently_viewed');
		that.$('select').trigger('change');

		// clear the search box?

		return false;

	},

	search: function(ev){
		// Search was clicked
		var that = this;

		// Get search input (if any)
		var search_input = that.$('input.search-query').val();
		search_input = $.trim(search_input);

		if(search_input.length < 1){
			alert('Please search for something!');
			return false;
		}

		// Display loading icon
		that.render_loading_threads();

		// Get those threads and display them?
		// - not checking cache at all?
		var AttachmentsCollection = new App.Collections.Attachments();
		AttachmentsCollection.fetch_for_search({
			text: search_input, // handles: AND, OR, has:attachment, etc.
			success: function(attachments){

				// Attachment also includes Thread._id and Email._id

				// Only show 20 attachments at a time?
				attachments = attachments.splice(0,20);

				// Sort by date
				attachments = App.Utils.sortBy({
					arr: attachments,
					path: 'date',
					direction: 'desc',
					type: 'date'
				});

				// Template
				var template = App.Utils.template('t_search_attachments_results');

				// Write HTML
				that.$('.search_attachments_results').html(template(attachments));

				// Scroll to bottom
				that.scroll_to_bottom();

			}
		});

		return false;
	},

	recent_attachments: function(){
		// Renders recently viewed threads
		var that = this;

		// Display loading icon
		// that.render_loading_threads();

		// Get those threads and display them?
		// - not checking cache at all?
		var AttachmentsCollection = new App.Collections.Attachments();
		AttachmentsCollection.fetch_recent({
			success: function(attachments){

				// Attachment also includes Thread._id and Email._id

				// Only show 20 attachments at a time?
				attachments = attachments.splice(0,20);

				// Sort by date
				attachments = App.Utils.sortBy({
					arr: attachments,
					path: 'date',
					direction: 'desc',
					type: 'date'
				});

				// Template
				var template = App.Utils.template('t_search_attachments_results');

				// Write HTML
				that.$('.search_attachments_results').html(template(attachments));

				// Scroll to bottom
				that.scroll_to_bottom();

			}
		});

		return false;

	},

	received_attachments: function(){
		// Renders recently viewed threads
		var that = this;

		// Display loading icon
		// that.render_loading_threads();

		// Get those threads and display them?
		// - not checking cache at all?
		var AttachmentsCollection = new App.Collections.Attachments();
		AttachmentsCollection.fetch_received({
			success: function(attachments){

				// Attachment also includes Thread._id and Email._id

				// Only show 20 attachments at a time?
				attachments = attachments.splice(0,20);

				// Sort by date
				attachments = App.Utils.sortBy({
					arr: attachments,
					path: 'date',
					direction: 'desc',
					type: 'date'
				});

				// Template
				var template = App.Utils.template('t_search_attachments_results');

				// Write HTML
				that.$('.search_attachments_results').html(template(attachments));

				// Scroll to bottom
				that.scroll_to_bottom();

			}
		});

		return false;

	},

	sent_attachments: function(){
		// Renders recently viewed threads
		var that = this;

		// Display loading icon
		// that.render_loading_threads();

		// Get those threads and display them?
		// - not checking cache at all?
		var AttachmentsCollection = new App.Collections.Attachments();
		AttachmentsCollection.fetch_sent({
			success: function(attachments){

				// Attachment also includes Thread._id and Email._id

				// Only show 20 attachments at a time?
				attachments = attachments.splice(0,20);

				// Sort by date
				attachments = App.Utils.sortBy({
					arr: attachments,
					path: 'date',
					direction: 'desc',
					type: 'date'
				});

				// Template
				var template = App.Utils.template('t_search_attachments_results');

				// Write HTML
				that.$('.search_attachments_results').html(template(attachments));

				// Scroll to bottom
				that.scroll_to_bottom();

			}
		});

		return false;

	},

	view_attachment: function(ev){
		// Show an attachment
		// - different saving options?
		// - filepicker.io!

		// Shows the view for the attachment
		var that = this;
		var elem = ev.currentTarget;

		// Get url path to attachment
		var url_path = $(elem).attr('data-path');

		// Open attachment in new View
		// - subView
		navigator.app.loadUrl(url_path, { openExternal:true });

		// App.Utils.Notification.toast('Loading in ChildBrowser (should load in a new View, with options for )');
		// if(usePg){
		// 	window.plugins.childBrowser.showWebPage(path,{
		// 		showLocationBar: false,
		// 		showAddress: false,
		// 		showNavigationBar: false
		// 	});
		// }
		// window.open(App.Credentials.s3_bucket + path);
		return false;

	},

	view_thread: function(ev){
		// Show an attachment
		// - different saving options?
		// - filepicker.io!
		
		var that = this;
		var elem = ev.currentTarget;

		// Get Thread id
		var id = $(elem).attr('data-id');

		// Set last scroll position
		this.last_scroll_position = $('.threads_holder').scrollTop();
		this.$el.parents('.main_body').attr('last-scroll-position',this.last_scroll_position);

		// Launch view for that Thread
		Backbone.history.loadUrl('view_thread/' + id + '/searching');

	},

	scroll_to_bottom: function(){
		// Re-render window and scroll to bottom

		// // Change size of window based on display size
		// $('.search_attachments_results').css({
		// 	"max-height": App.Data.xy.win_height - (60 + 50),  // footer height = 60. search_footer height = 50. critera height = 50
		// 	width: App.Data.xy.win_width
		// });
		// $('.search_attachments_results .attachment:first-child').css({
		// 	"margin-top" : App.Data.xy.win_height - (60 + 105) // both footers, attachment height
		// });

		// $('.search_attachments_results').scrollTop($('.search_attachments_results').height() + 1000);

		return;
	},


	render_init: function(){
		// Render the loading screen
		var that = this;

		// Template
		var template = App.Utils.template('t_search_attachments');

		// Write HTML
		this.$el.html(template({
			filter_options: that.filter_options
		}));

		// Choose Recent
		that.$('select').val('recent');
		that.$('select').trigger('change');

		// Enable mobiscroll select (modal is cleanest)
		that.$('.prefilters_select').mobiscroll().select({
			theme: 'android-ics',
			display: 'bubble',
			mode: 'mixed',
			inputClass: 'prefilters_select'
		});

		// Resize fluid elements
		this.resize_fluid_page_elements();
		this.resize_scroller();

		return this;

	},

	render_loading_threads: function(){
		var that = this;

		// Template
		var template = App.Utils.template('t_search_thread_results_loading');

		// Write HTML
		that.$('.search_emails_thread_results').html(template());

		// Resize windows and scroller panes accordingly
		this.resize_fluid_page_elements();
		this.resize_scroller();

	},

	render_waiting_for_search: function(){
		var that = this;

		// Template
		var template = App.Utils.template('t_search_waiting_for_input');

		// Write HTML
		that.$('.search_emails_thread_results').html(template());

	},

	render: function() {
		var that = this;

		// Render initial body
		this.render_init();



		// How old is it?
		// Do we need to do a refresh?

		// View is based on what data we do have, and a view makes sure the new data is being found? 

		return this;
	}
});


App.Views.SearchLinks = Backbone.View.extend({
	
	className: 'search_emails_inside_view',

	last_scroll_position: 0,

	// Pre-filtered options
	filter_options: [
		// {
		// 	name: 'Search',
		// 	key: 'search'
		// },
		{
			name: 'Recent',
			key: 'recent'
		},
		{
			name: 'Received',
			key: 'received'
		},
		{
			name: 'Sent',
			key: 'sent'
		}
	],

	events: {

		'change .prefilters_select' : 'click_prefilter',
		'click .form-search .submit' : 'search',
		'click .show_search' : 'show_search',
		'click .form-search .cancel' : 'hide_search',

		'click .parsed_link' : 'view_link'

	},

	initialize: function(options) {
		var that = this;
		_.bindAll(this, 'render');
		_.bindAll(this, 'render_loading_threads');

		// _.bindAll(this, 'recently_viewed');
		// _.bindAll(this, 'recently_acted_on');
		// _.bindAll(this, 'sent_emails');

		_.bindAll(this, 'show_search');
		_.bindAll(this, 'hide_search');

	},

	click_prefilter : function(ev){
		// What are we filtering by?
		var that = this;
		var elem = ev.currentTarget;

		// Get selected element

		$(elem).blur();

		var elem_key = $(elem).find(':selected').val();

		// // de-active other filters
		// that.$('.prefilter').removeClass('active');

		// // mark this filter as active
		// $(elem).addClass('active');

		// re-search based on this new filter
		// - cache searches?
		// - use diff patching

		// Get type to search on
		// var elem_key = $(elem).attr('data-action');
		var type = _.filter(that.filter_options,function(opt){
			if(opt.key == elem_key){
				return true;
			}
		});
		if(type.length != 1){
			clog('failed');
			return false;
		}
		type = type[0];

		// Search using these conditions
		// - or not conditions, depends
		switch(type.key){

			case 'recent':
				// Uses info from local datastore
				that.recent_links();
				break;

			case 'received':
				// Uses info from local datastore
				that.received_links();
				break;

			case 'sent':
				// Sent attachments
				that.sent_links();
				break;

		}
		


		return false;
	},


	show_search: function(){
		// Show the search options
		var that = this;

		// hide search input
		that.$('.form-search').removeClass('nodisplay');

		// show select box
		that.$('.search_prefilters').addClass('nodisplay');

		// Focus on search box
		that.$('.form-search input[type="text"]').focus();

		// Display waiting icon
		that.render_waiting_for_search();

	},


	hide_search: function(){
		// Show the search options
		var that = this;

		// hide search input
		that.$('.form-search').addClass('nodisplay');

		// show select box
		that.$('.search_prefilters').removeClass('nodisplay');

		// switch select box to 2nd option
		that.$('select').val('recently_viewed');
		that.$('select').trigger('change');

		// clear the search box?

		return false;

	},

	search: function(ev){
		// Search was clicked
		var that = this;

		// Get search input (if any)
		var search_input = that.$('input.search-query').val();
		search_input = $.trim(search_input);

		if(search_input.length < 1){
			alert('Please search for something!');
			return false;
		}

		// Display loading icon
		that.render_loading_threads();

		// Get those threads and display them?
		// - not checking cache at all?
		var LinksCollection = new App.Collections.Links();
		LinksCollection.fetch_for_search({
			text: search_input, // todo: handles: AND, OR, has:attachment, etc.
			success: function(links){

				// Attachment also includes Thread._id and Email._id

				// Only show 20 links at a time?
				links = links.splice(0,100);

				// Sort by date
				links = App.Utils.sortBy({
					arr: links,
					path: 'date',
					direction: 'desc',
					type: 'date'
				});

				// Template
				var template = App.Utils.template('t_search_links_results');

				// Write HTML
				that.$('.search_links_results').html(template(links));

				// Scroll to bottom
				that.scroll_to_bottom();

			}
		});

		return false;
	},

	recent_links: function(){
		// Renders recently viewed threads
		var that = this;

		// Display loading icon
		// that.render_loading_threads();

		// Get those threads and display them?
		// - not checking cache at all?
		var LinksCollection = new App.Collections.Links();
		LinksCollection.fetch_recent({
			success: function(links){

				// Attachment also includes Thread._id and Email._id

				// Only show 20 links at a time?
				links = links.splice(0,100);

				// Sort by date
				links = App.Utils.sortBy({
					arr: links,
					path: 'date',
					direction: 'desc',
					type: 'date'
				});

				// Template
				var template = App.Utils.template('t_search_links_results');

				// Write HTML
				that.$('.search_links_results').html(template(links));

				// Scroll to bottom
				that.scroll_to_bottom();

			}
		});

		return false;

	},

	received_links: function(){
		// Renders recently viewed threads
		var that = this;

		// Display loading icon
		// that.render_loading_threads();

		// Get those threads and display them?
		// - not checking cache at all?
		var LinksCollection = new App.Collections.Links();
		LinksCollection.fetch_received({
			success: function(links){

				// Attachment also includes Thread._id and Email._id

				// Only show 20 links at a time?
				links = links.splice(0,100);

				// Sort by date
				links = App.Utils.sortBy({
					arr: links,
					path: 'date',
					direction: 'desc',
					type: 'date'
				});

				// Template
				var template = App.Utils.template('t_search_links_results');

				// Write HTML
				that.$('.search_links_results').html(template(links));

				// Scroll to bottom
				that.scroll_to_bottom();

			}
		});

		return false;

	},

	sent_links: function(){
		// Renders recently viewed threads
		var that = this;

		// Display loading icon
		// that.render_loading_threads();

		// Get those threads and display them?
		// - not checking cache at all?
		var LinksCollection = new App.Collections.Links();
		LinksCollection.fetch_sent({
			success: function(links){

				// Attachment also includes Thread._id and Email._id

				// Only show 20 links at a time?
				links = links.splice(0,100);

				// Sort by date
				links = App.Utils.sortBy({
					arr: links,
					path: 'date',
					direction: 'desc',
					type: 'date'
				});

				// Template
				var template = App.Utils.template('t_search_links_results');

				// Write HTML
				that.$('.search_links_results').html(template(links));

				// Scroll to bottom
				that.scroll_to_bottom();

			}
		});

		return false;

	},

	view_link: function(ev){
		// Open a window with the link in it
		// - should instead open up a new View with info about the link (copy, visit, etc.)
		var that = this,
			elem = ev.currentTarget;

		// Get link
		var url = $(elem).attr('data-link');

		// Launch window
		// var ref = window.open(url, '_blank', 'location=yes');
		navigator.app.loadUrl(url, { openExternal:true });

		return false;

	},

	scroll_to_bottom: function(){
	},


	render_init: function(){
		// Render the loading screen
		var that = this;

		// Template
		var template = App.Utils.template('t_search_links');

		// Write HTML
		this.$el.html(template({
			filter_options: that.filter_options
		}));

		// Choose Recent
		that.$('select').val('recent');
		that.$('select').trigger('change');

		// Enable mobiscroll select (modal is cleanest)
		that.$('.prefilters_select').mobiscroll().select({
			theme: 'android-ics',
			display: 'bubble',
			mode: 'mixed',
			inputClass: 'prefilters_select'
		});

		return this;

	},

	render_loading_threads: function(){
		var that = this;

		// Template
		var template = App.Utils.template('t_search_thread_results_loading');

		// Write HTML
		that.$('.search_emails_thread_results').html(template());

	},

	render_waiting_for_search: function(){
		var that = this;

		// Template
		var template = App.Utils.template('t_search_waiting_for_input');

		// Write HTML
		that.$('.search_emails_thread_results').html(template());

	},

	render: function() {
		var that = this;

		// Render initial body
		this.render_init();



		// How old is it?
		// Do we need to do a refresh?

		// View is based on what data we do have, and a view makes sure the new data is being found? 

		return this;
	}
});



App.Views.Collections = Backbone.View.extend({
	
	el: '.body_container',

	events: {
	},

	initialize: function(options) {
		_.bindAll(this, 'render');

		// this.el = this.options.el;

	},

	go_back: function(ev){
		Backbone.history.loadUrl('body');
		return false;
	},

	render: function() {
		var that = this;
		// Data
		// var data = this.options.accounts.UserGmailAccounts;

		// Should start the updater for accounts
		// - have a separate view for Accounts?

		// Template
		var template = App.Utils.template('t_collections');

		// Write HTML
		this.$el.html(template());

		return this;
	}
});





App.Views.SendersList = Backbone.View.extend({

	el: '.senders_list',

	events: {
		// 'click button' : 'login' // composing new email,
		'click .move_sender' : 'move_sender'
	},

	initialize: function() {
		// _.bindAll(this, 'render');

		var that = this;

		// Load the model

		this.status = this.options.status;

		var searchQuery = {
			'model' : 'AppMinimalContact',
			'fields' : [],
			'conditions' : {
				status: this.status,
				live: 1
			},
			'limit' : 500
		};
		if(this.status == 'pending'){ // Pending including emails without a status
			searchQuery.conditions = {
				"$or" : [
					{
						status: this.status,
						live: 1
					},
					{
						status: {"$exists" : false}, 
						live: 1
					}
				]
			};
		}

		this.ready = $.Deferred();

		Api.search({
			data: searchQuery,
			success: function(res){
				res = JSON.parse(res);
				// clog(res.data);
				// clog($(that.el));
				that.ready.resolve(res.data);
			}
		});

		return this;
	},

	close: function(){

		this.remove();
		this.unbind();

		clog('clsin');
		clog(this);

	},

	move_sender: function(ev){
		var elem = ev.currentTarget;

		// Change status
		var status = $(elem).attr('data-status');

		var $parent = $(elem).parents('.sender');
		var id = $parent.attr('data-id');

		// Changed status?		
		if(status != $parent.attr('data-status')){
			// Make API call
			Api.update({
				data: {
					model: 'AppMinimalContact',
					id: id,
					paths: {
						"$set" : {
							"status" : status
						}
					}
				},
				success: function(res){
					res = JSON.parse(res);
				}
			});
			// Changed the status, remove from this list
			$parent.transition({
				opacity: 0
			},300,function(){
				$(this).remove();
			});
		} else {
			// Same
			App.Utils.toast('No Change');
		}

		return false;
	},

	render: function() {
		var that = this;
		
		var template = App.Utils.template('t_senders_list_loading');
		this.$el.html(template());

		this.ready.promise()
			.then(function(contacts){

				$.each(contacts,function(i,val){
					contacts[i].AppMinimalContact.domain = contacts[i].AppMinimalContact.email.split('@').splice(-1,1).toString();
					contacts[i].AppMinimalContact.domain = contacts[i].AppMinimalContact.domain.charAt(0).toUpperCase() + contacts[i].AppMinimalContact.domain.slice(1);
					contacts[i].AppMinimalContact.local = contacts[i].AppMinimalContact.email.split('@').splice(0,contacts[i].AppMinimalContact.email.split('@').length - 1).toString();
					contacts[i].AppMinimalContact.local = contacts[i].AppMinimalContact.local.charAt(0).toUpperCase() + contacts[i].AppMinimalContact.local.slice(1);
				});

				// Sort by domain
				contacts = App.Utils.sortBy(contacts,'AppMinimalContact.domain','desc');

				// clog(contacts);

				// Template
				var template = App.Utils.template('t_senders_list');

				that.$el.html(template(contacts));
			});

		return this;

	}


});


App.Views.Settings = Backbone.View.extend({
	
	className: 'view_settings',

	events: {
		'click .setting[data-setting-type="general"]' : 'general_settings',
		'click .setting[data-setting-type="sync"]' : 'sync_inbox',
		'click .setting[data-setting-type="speedtest"]' : 'speedtest',
		'click .setting[data-setting-type="flushcache"]' : 'flushcache',
		'click .setting[data-setting-type="close"]' : 'closeapp',
		'click .setting[data-setting-type="logout"]' : 'logout',
		'click .cancel' : 'cancel'
	},

	initialize: function(options) {
		_.bindAll(this, 'render');
		_.bindAll(this, 'beforeClose');
		_.bindAll(this, 'cancel');
		var that = this;

	},

	beforeClose: function(){
		var that = this;

		// kill any subviews
		if(this.speedtestSubView){
			this.speedtestSubView.close(); // should emit an event instead?
		}
		if(this.displayedSubview){
			this.displayedSubview.close(); // should emit an event instead?
		}

		// De-bubble this back button
		App.Utils.BackButton.debubble(this.backbuttonBind);

	},

	cancel: function(ev){
		var that = this;
		// Going back to mailbox
		// - highlight the correct row we were on? (v2)

		// Is there some way of referencing the Backbone view instead of using jquery? 

		// Re-show .main_body
		$('.main_body').removeClass('nodisplay');

		// Scroll to correct position
		var scrollTo = 0;
		if($('.main_body').attr('last-scroll-position')){
			scrollTo = $('.main_body').attr('last-scroll-position');
		}
		$('.threads_holder').scrollTop(scrollTo);

		// Close myself
		this.close();

		return false;
	},

	general_settings: function(ev){

		var that = this;

		// Launch speedtest subView
		// - should it really be a subView?

		this.displayedSubview = new App.Views.GeneralSettings();

		// Render the subView
		this.displayedSubview.render();

		// Append to View
		this.$el.after(this.displayedSubview.el); // could do this.speedtestSubView.render().el ?

		// Hide this View
		this.$el.hide();

		// Listen for subview closing
		this.displayedSubview.on('back', function(){
			// Show the parent
			// - close the guy

			this.displayedSubview.close();

			that.$el.show();

		}, this);

	},

	sync_inbox: function(ev){
		// Triggers an inbox sync with Gmail

		var that = this;

		// trigger the sync event
		Api.event({
			data: {
				event: 'Email.sync',
				delay: 0,
				obj: {}
			}
		});

		App.Utils.Notification.toast('Sync has been triggered, it may take a moment');

		return;
	},

	speedtest: function(ev){
		var that = this;

		// Launch speedtest subView
		// - should it really be a subView?

		this.speedtestSubView = new App.Views.SpeedTest();

		// Render the subView
		this.speedtestSubView.render();

		console.log(this.speedtestSubView);

		// Append to View
		this.$el.after(this.speedtestSubView.el); // could do this.speedtestSubView.render().el ?

		// Hide this View
		this.$el.hide();

		// Listen for subview closing
		this.speedtestSubView.on('back', function(){
			// Show the parent
			// - close the guy

			this.speedtestSubView.close();

			that.$el.show();

		}, this);

		return;
	},

	flushcache: function(ev){
		// Flushes the cache
		// - seems to fix some problems with models/collections

		var that = this;

		var c = confirm('It might take a minute for previous emails to re-appear, as they are loaded back into the cache');
		if(c){
			// Wait for cache to flush
			App.Utils.Storage.flush()
				.then(function(){
					// worked
					alert('Cache Flushed');
				});
		}

		return;
	},

	closeapp: function(ev){
		var that = this;

		navigator.app.exitApp();
	},

	logout: function(ev){
		var that = this;

		// Confirm logout
		Backbone.history.loadUrl('confirm_logout');
	},

	render: function() {
		var that = this;

		// Build from template
		var template = App.Utils.template('t_settings');

		// Settings
		var settings = [
			{
				key: 'general',
				text: 'General Settings',
				subtext: 'random things',
			},
			{
				key: 'sync',
				text: 'Sync Inbox',
				subtext: 'reconcile with gmail in a jiffy',
			},
			// {
			// 	key: 'theme',
			// 	text: 'Theme',
			// 	subtext: 'lots of pretty colors',
			// },
			{
				key: 'speedtest',
				text: 'Speed Test',
				subtext: 'how fast is your data connection?',
			},
			{
				key: 'flushcache',
				text: 'Flush Cache',
				subtext: 'fixes most problems',
			},
			{
				key: 'close',
				text: 'Close',
				subtext: 'in case BackButton broke'
			},
			{
				key: 'logout',
				text: 'Log out',
				subtext: 'never gonna give you up tho'
			}
		];

		// Write HTML
		that.$el.html(template(settings));

		// back button
		this.backbuttonBind = App.Utils.BackButton.newEnforcer(this.cancel);

		return this;

	}

});

App.Views.GeneralSettings = Backbone.View.extend({

	className: 'settings_general_view',

	events: {
		'click .cancel' : 'backButton'
	},

	initialize: function() {
		_.bindAll(this, 'render');
		_.bindAll(this, 'beforeClose');
		_.bindAll(this, 'back');

	},

	beforeClose: function(){
		// De-bubble this back button
		App.Utils.BackButton.debubble(this.backbuttonBind);
	},

	backButton: function(ev){
		var that = this,
			elem = ev.currentTarget;

		this.back();

		return false;
	},

	back: function(){
		// Go back to settings page
		var that = this;

		this.trigger('back');
	},

	render: function(){
		var that = this;

		// Remove any previous one
		// $('.logout').remove();

		// Build from template
		var template = App.Utils.template('t_settings_general');

		// Get Settings from Cache
		App.Utils.Storage.get('settings', 'critical')
			.then(function(settings){
				if(!settings){
					// No settings created! 
					// - use defaults
				}
			});


		// Build settings data
		// - already loaded into the app, so just show those settings
		

		// Write HTML
		that.$el.html(template(App.Data.settings));

		// Back button
		this.backbuttonBind = App.Utils.BackButton.newEnforcer(this.back);

		return this;
	}

});

App.Views.SpeedTest = Backbone.View.extend({

	className: 'speedtest_view',

	events: {
		'click #start' : 'start',
		'click .cancel' : 'backButton'
	},

	initialize: function() {
		_.bindAll(this, 'render');
		_.bindAll(this, 'beforeClose');
		_.bindAll(this, 'back');

	},

	beforeClose: function(){
		// De-bubble this back button
		App.Utils.BackButton.debubble(this.backbuttonBind);
	},

	start: function(ev){
		// Start the speedtest
		var that = this,
			elem = ev.currentTarget;

		// Hide button
		this.$('.pre_start').hide();

		// Show "running" text
		this.$('.running').show();

		// start
		var st = new SpeedTest();
		st.run({
			runCount: 5,
			imgUrl: "https://s3.amazonaws.com/emailboxv1/speedtest.jpg",
			size: 85400,
			onStart: function() {
				// alert('Before Running Speed Test');

			}

			,onEnd: function(speed_results) {

				console.log(speed_results);

				speed_results.connection_type = that.checkConnection();

				// Hide "running" text
				that.$('.running').hide();

				// Show results

				// Build template
				var template = App.Utils.template('t_speedtest_results');

				// console.info(template(speed_results));

				speed_results.KBps = speed_results.KBps.toFixed(2);
				speed_results.Kbps = speed_results.Kbps.toFixed(2);

				// Write HTML
				that.$('.results').html(template(speed_results));

				// Show results
				that.$('.results').show();

				// alert( 'Speed test complete:  ' + speed.Kbps + ' Kbps');
				// put your logic here
				if( speed_results.Kbps < 200 ){
					// alert('Your connection is too slow');
				}
			}
		});


	},

	checkConnection: function(){
		var networkState = navigator.connection.type;

		var states = {};
		states[Connection.UNKNOWN]  = 'Unknown connection';
		states[Connection.ETHERNET] = 'Ethernet connection';
		states[Connection.WIFI]     = 'WiFi connection';
		states[Connection.CELL_2G]  = 'Cell 2G connection';
		states[Connection.CELL_3G]  = 'Cell 3G connection';
		states[Connection.CELL_4G]  = 'Cell 4G connection';
		states[Connection.CELL]     = 'Cell generic connection';
		states[Connection.NONE]     = 'No network connection';

		return states[networkState];
	},

	backButton: function(ev){
		var that = this,
			elem = ev.currentTarget;

		this.back();

		return false;
	},

	back: function(){
		// Go back to settings page
		var that = this;

		this.trigger('back');
	},

	render: function(){
		var that = this;

		// Remove any previous one
		// $('.logout').remove();

		// Build from template
		var template = App.Utils.template('t_speedtest');

		// Write HTML
		that.$el.html(template());

		// Back button
		this.backbuttonBind = App.Utils.BackButton.newEnforcer(this.back);

		return this;
	}

});

App.Views.Logout = Backbone.View.extend({

	className: 'logout',

	events: {
		'click #logout' : 'logout' // logging out
	},

	initialize: function() {
		_.bindAll(this, 'render');

	},

	logout: function(ev){
		// This doesn't work at all
		// - just stopped working completely for some reason

		alert('logout clicked');
		Backbone.history.loadUrl('logout');
		return false;

	},

	render: function(){
		var that = this;

		// Remove any previous one
		// $('.logout').remove();

		// Build from template
		var template = App.Utils.template('t_logout');

		// Write HTML
		that.$el.html(template());

		// Show logout
		that.$el.addClass('display');

		that.$el.transition({
			top: '150px',
			opacity: 1
		},'fast');
		
		// Just show a logout dialog box
		var p = confirm('Logout?');
		if(p){
			Backbone.history.loadUrl('logout');
		} else {
			that.close();
		}

		return this;
	}

});

App.Views.BodyLogin = Backbone.View.extend({
	
	el: 'body',

	events: {
		'click p.login button' : 'login',
		'click p.scan_login button' : 'scan_login'

	},

	initialize: function() {
		_.bindAll(this, 'render');

	},

	scan_login: function(ev){
		// Testing scan_login

		// alert('testing scanner');
		window.plugins.barcodeScanner.scan(
			function (result) { 
				// Got a barcode

				try {
					var barcode = result.text.split('+');
				} catch(err){
					alert('Failed loading barcode, please try again');
					return false;
				}

				if(barcode.length != 2){
					alert('Failed barcode test. Please try again');
					return false;
				}

				// Split into user and access_token
				var access_token = barcode[0],
					user_identifier = barcode[1];

				// Set that value to our login value

				// Try logging in with it
				// - eventually, exchange for an access_token

				App.Utils.Storage.set(App.Credentials.prefix_access_token + 'user', user_identifier, 'critical')
					.then(function(){
						// Saved user!
					});

				App.Utils.Storage.set(App.Credentials.prefix_access_token + 'access_token', access_token, 'critical')
					.then(function(){

						// Reload page, back to #home
						
						// clear body
						$('body').html('');

						// Reload page, back to #home
						window.location = [location.protocol, '//', location.host, location.pathname].join('');
					});
					
			}, 
			function (error) { 
				alert("Scanning failed: " + error); 
			} 
		);

		return false;

	},

	login: function(ev){
		// Start OAuth process
		var that = this;

		var p = {
			app_id : App.Credentials.app_key,
			callback : [location.protocol, '//', location.host, location.pathname].join('')
		};

		if(useForge){
			p.callback = 'https://getemailbox.com/testback/';
			var params = $.param(p);


			// Hide the News window
			// that.$el.html('<div class="loading">Freshening up...</div>');
			that.$el.html('<div class="loading"></div>');

			forge.tabs.openWithOptions({
					url: App.Credentials.base_api_url + "/apps/authorize/?" + params,
					pattern: 'https://getemailbox.com/testback/*'
				}, function (data) {

					// First, parse the query string
					var params = {}, queryString = data.url.substring(data.url.indexOf('#')+1),
						regex = /([^&=]+)=([^&]*)/g, m;
					while (m = regex.exec(queryString)) {
						params[decodeURIComponent(m[1])] = decodeURIComponent(m[2]);
					}

					var qs = App.Utils.getUrlVars(data.url);

					if(typeof qs.user_token == "string"){
						// Have a user_token
						// - save it to localStorage
						App.Utils.Storage.set(App.Credentials.prefix_user_token + 'user_token', qs.user_token, 'critical')
							.then(function(){
								
								// Reload page, back to #home
								forge.logging.info('reloading');
								window.location = [location.protocol, '//', location.host, location.pathname].join('');
							});
						
					} else {
						// Show login splash screen
						// - failed login
						
						forge.logging.info('== failed logging in ==');
						var page = new App.Views.BodyLogin();
						App.router.showView('bodylogin',page);
					}

					forge.logging.info('PARAMS:');
					forge.logging.info(params);

					// forge.request.ajax({
					// 	url: 'https://www.googleapis.com/oauth2/v1/userinfo?access_token='+params['access_token'],
					// 	dataType: 'json',
					// 	success: function (data) {
					// 		$('#results').html('<div><img src="'+data.picture+'"><br>Name: '+data.name+'<br>Email: '+data.email+'<br>Gender: '+data.gender+'</div>');
					// 	},
					// 	error: function (error) {
					// 		alert("Error");
					// 	}
					// });

				});
		} else if(usePg){
			
			var p = {
				response_type: 'token',
				client_id : App.Credentials.app_key,
				redirect_uri : 'https://getemailbox.com/testback/'
				// state // optional
				// x_user_id // optional	
			};
			var params = $.param(p);
			var call_url = App.Credentials.base_api_url + "/apps/authorize/?" + params;

			// alert('launching childbrowser');
			window.plugins.childBrowser.showWebPage(call_url,{
				showLocationBar: false,
				showAddress: false,
				showNavigationBar: false
			});
			window.plugins.childBrowser.onLocationChange = function(loc){
				//Really cool hack
				// window.plugins.childBrowser.close();

				var parser = document.createElement('a');
				parser.href = loc;
				// console.log(loc);

				// alert('u');
				// alert(parser.hostname);
				// alert(parser.pathname);

				// return false;

				var url = loc;

				if(parser.hostname == 'getemailbox.com' && parser.pathname == '/testback/'){
					
					// window.plugins.childBrowser.close();
					// alert('closing childbrowser after /testback');
					// return false;

					// var qs = App.Utils.getUrlVars();
					var oauthParams = App.Utils.getOAuthParamsInUrl(url);

					// if(typeof qs.user_token == "string"){
					if(typeof oauthParams.access_token == "string"){

						// Have an access_token
						// - save it to localStorage

						// App.Utils.Storage.set(App.Credentials.prefix_access_token + 'user', oauthParams.user_identifier);
						// App.Utils.Storage.set(App.Credentials.prefix_access_token + 'access_token', oauthParams.access_token);

						App.Utils.Storage.set(App.Credentials.prefix_access_token + 'user', oauthParams.user_identifier, 'critical')
							.then(function(){
								// Saved user!
							});

						App.Utils.Storage.set(App.Credentials.prefix_access_token + 'access_token', oauthParams.access_token, 'critical')
							.then(function(){
								
								// Reload page, back to #home
								// forge.logging.info('reloading');

								// alert('success');
								window.plugins.childBrowser.close();


								// // Reload page, back to #home
								// window.location = [location.protocol, '//', location.host, location.pathname].join('');

								$('body').html('');

								// Reload page, back to #home
								window.location = [location.protocol, '//', location.host, location.pathname].join('');
							});


					} else {
						// Show login splash screen
						var page = new App.Views.BodyLogin();
						App.router.showView('bodylogin',page);
					}

					return;


					// First, parse the query string
					var params = {}, queryString = url.substring(url.indexOf('#')+1),
						regex = /([^&=]+)=([^&]*)/g, m;
					while (m = regex.exec(queryString)) {
						params[decodeURIComponent(m[1])] = decodeURIComponent(m[2]);
					}

					var qs = App.Utils.getUrlVars(url);

					if(typeof qs.user_token == "string"){
						// Have a user_token
						// - save it to localStorage
						App.Utils.Storage.set(App.Credentials.prefix_user_token + 'user_token', qs.user_token, 'critical')
							.then(function(){
								
								// Reload page, back to #home
								// forge.logging.info('reloading');

								// alert('success');
								window.plugins.childBrowser.close();

								$('body').html('');
								window.location = [location.protocol, '//', location.host, location.pathname].join('');
							});
						
					} else {
						// Show login splash screen
						// - failed login

						alert('Login Failed');
						window.plugins.childBrowser.close();
						
						// forge.logging.info('== failed logging in ==');
						var page = new App.Views.BodyLogin();
						App.router.showView('bodylogin',page);

					}

				}

				return;



				// First, parse the query string
				var params = {}, queryString = url.substring(url.indexOf('#')+1),
					regex = /([^&=]+)=([^&]*)/g, m;
				while (m = regex.exec(queryString)) {
					params[decodeURIComponent(m[1])] = decodeURIComponent(m[2]);
				}

				var qs = App.Utils.getUrlVars(url);

				if(typeof qs.user_token == "string"){
					// Have a user_token
					// - save it to localStorage
					App.Utils.Storage.set(App.Credentials.prefix_user_token + 'user_token', qs.user_token, 'critical')
						.then(function(){
							
							// Reload page, back to #home
							// forge.logging.info('reloading');

							window.location = [location.protocol, '//', location.host, location.pathname].join('');
						});
					
				} else {
					// Show login splash screen
					// - failed login
					
					forge.logging.info('== failed logging in ==');
					var page = new App.Views.BodyLogin();
					App.router.showView('bodylogin',page);
				}

				forge.logging.info('PARAMS:');
				forge.logging.info(params);



				//DOM auto-parses
				if (parser.hostname == "www.filepicker.io" && parser.pathname == FINISHED_PATH) {
					window.plugins.childBrowser.close();
					var args = parser.search.substring(1).split('&');
					argsParsed = {};

					//Kindly provided by 'http://stackoverflow.com/questions/2090551/parse-query-string-in-javascript'
					for (i=0; i < args.length; i++) {
						arg = unescape(args[i]);

						if (arg.indexOf('=') == -1) {
							argsParsed[arg.trim()] = true;
						} else {
							kvp = arg.split('=');
							argsParsed[kvp[0].trim()] = kvp[1].trim();
						}
					}
					callback(argsParsed);
				}
			};

		} else {

			var p = {
				response_type: 'token',
				client_id : App.Credentials.app_key,
				redirect_uri : [location.protocol, '//', location.host, location.pathname].join('')
				// state // optional
				// x_user_id // optional	
			};
			var params = $.param(p);

			window.location = App.Credentials.base_api_url + "/apps/authorize/?" + params;

		}

		return false;

	},

	render: function() {

		var template = App.Utils.template('t_body_login');

		// Write HTML
		$(this.el).html(template());

		return this;
	}
});

App.Views.BodyUnreachable = Backbone.View.extend({
	
	el: 'body',

	events: {
		'click .retry' : 'reload'

	},

	initialize: function() {
		_.bindAll(this, 'render');

	},

	reload: function(){
		// Reload the page
		// - easiest way, simpler than reloading all the fetch calls
		window.location = window.location.href;
	},

	render: function() {

		var template = App.Utils.template('t_body_unreachable');

		// Write HTML
		$(this.el).html(template());

		return this;
	}
});


App.Views.Modal = Backbone.View.extend({
	
	el: 'body',

	events: {
	},

	initialize: function() {
		_.bindAll(this, 'render');
	},

	render: function() {

		// Remove any previous version
		$('#modalIntro').remove();

		// Build from template
		var template = App.Utils.template('t_modal_intro');

		// Write HTML
		$(this.el).append(template());

		// Display Modal
		$('#modalIntro').modal();

		return this;
	}

});


App.Views.Toast = Backbone.View.extend({
	
	el: 'body',

	events: {
	},

	initialize: function() {
		_.bindAll(this, 'render');
	},

	render: function() {

		// Remove any previous version
		$('#toast').remove();

		// Build from template
		var template = App.Utils.template('t_toast');

		// Write HTML
		$(this.el).append(template({
			message: this.options.message
		}));

		$('#toast').animate({
			opacity: 1
		},'fast');

		// Display Modal
		window.setTimeout(function(){
			$('#toast').animate({
				opacity: 0
			},'fast',function(){
				$(this).remove();
			});
		},3000);

		return this;
	}

});


App.Views.OnlineStatus = Backbone.View.extend({
	
	className: 'online-status nodisplay',

	events: {},

	initialize: function() {
		_.bindAll(this, 'render');

		// Render it

		// display is on or off

		this.on('online',this.hide,this);
		this.on('offline',this.show,this);
	},

	show: function(){
		this.$el.removeClass('nodisplay');
	},

	hide: function(){
		// Add nodisplay
		this.$el.addClass('nodisplay');
	},

	render: function() {

		// Add to page

		// Build from template
		var template = App.Utils.template('t_online_status');

		// Write HTML
		// - to body
		this.$el.html(template());
		$('body').append(this.$el);

		return this;
	}

});


App.Views.DebugMessages = Backbone.View.extend({
	
	el: 'body',

	events: {
	},

	initialize: function() {
		_.bindAll(this, 'render');
		// _.bindAll(this, 're_render');
		// _.bindAll(this, 'render');

		// Bind to new debug message events
		App.Events.bind('debug_messages_update',this.render);

	},

	render: function() {

		// Remove any previous version
		$('#debug-messages').remove();

		// Get debug messages
		// - already in App.Data.debug_messages

		// Get data and sort it
		// - sort by date
		// - newest item is at the bottom?
		var data = $.extend({},App.Data.debug_messages);
		data = App.Utils.sortBy({
			arr: data,
			path: 'datetime',
			direction: 'asc',
			type: 'date'
		});

		// Displaying debug output, or just a "refreshing" thing? 

		// Build from template
		var template;
		if(1==0){
			template = App.Utils.template('t_debug_messages');
		} else {
			template = App.Utils.template('t_debug_messages_production');
		}

		// Write HTML
		$(this.el).prepend(template(App.Data.debug_messages));

		// timeago
		// - crude
		// this.$('.timeago').timeago();
		
		return this;
	}

});


App.Views.DelayModal = Backbone.View.extend({

	className: 'delay_modal',

	events: {
		// 'click .option' : 'click_option',
		'shorttap .option' : 'shorttap_option',
		'longtap .option' : 'longtap_option',
		// 'click .option' : 'longtap_option', // enabling will cause double-calendar on mobile
		
		'click .overlay' : 'cancel',
		'blur #pickadate' : 'picked_date',

		'click .btn-cancel' : 'cancel_confirmation',
		'click .btn-delay' : 'choose_confirmation'
	},

	initialize: function() {
		_.bindAll(this, 'render');
		_.bindAll(this, 'beforeClose');
		_.bindAll(this, 'cancel');
		_.bindAll(this, 'save_delay');

		this.threadView = $(this.options.context).parents('.thread');
		this.threadid = this.options.threadid;

	},

	beforeClose: function(){
		// Kill back button grabber
		var that = this;

		App.Utils.BackButton.debubble(this.backbuttonBind);

		return;
	},

	cancel: function(ev){
		// Remove overlay
		this.close();
		// $('#delay_modal').remove();
		// this.unbind();

		// call onComplete if exists
		if(this.options.onComplete){
			this.options.onComplete(null);
		} else {
			// Slide piece back in
			App.Plugins.Minimail.revert_box(this.options.context);
		}

		return false;
	},

	shorttap_option: function(ev){
		
		// Clicked an option
		// - take an action on the Thread
		var that = this,
			elem = ev.currentTarget;

		// Valid?
		if($(elem).hasClass('ignore')){
			return false;
		}

		// Get "wait" selected
		var waitType = $(elem).attr('data-type');

		var save_text = $.trim($(elem).text());

		// Get delay options (later today, etc.)
		var delay_options = App.Plugins.Minimail.getDelayOptions();
		
		// Get option from delay_options
		var wait = null,
			tmp_delay = null;
		$.each(delay_options,function(i,val){
			
			if(waitType == val.key){
				// using this one
				wait = val.wait;
				tmp_delay = val;
			}
		});
		if(wait == null){
			// alert('Invalid type used');
			this.close();
			return;
		}

		// Delay it
		// - no option, just using the delay right away
		that.save_delay(wait, tmp_delay.name);

		return;

		// Date
		// var arr = this.$("#date").mobiscroll().parseValue(wait);
		// console.log('hello');
		
		// // var mobi_inst = $('#date').mobiscroll('getInst');
		// var parsedScrollValues = App.Plugins.Minimail.formatDateForScroll(wait);
		// this.dateScroll.mobiscroll('setValue',parsedScrollValues,true);

		var parsedScrollValues = App.Plugins.Minimail.formatDateForScroll(wait);
		this.timeScroll.mobiscroll('setValue',parsedScrollValues,true);

		// Trigger date confirmation
		window.setTimeout(function(){
			that.$('.options').addClass('nodisplay');
			that.$('.choose_datetime').removeClass('nodisplay');
		
			// Full calendar
			$('#calendar').fullCalendar({
				// put your options and callbacks here
				// defaultView: 'month',
				dayClick: function(date) {
					// Select that date on calendar
					$('.fc-state-highlight').removeClass('fc-state-highlight');
					$(this).addClass('fc-state-highlight');
				}
			});

			// Add button class (hacky)
			// $('.fc-button').addClass('btn');

			// // $('.fc-button-today').click();
			// window.setTimeout(function(){
			// 	// $('#calendar').fullCalendar('today');
			// 	// $('.fc-button-today').trigger('click');
			// 	$('#calendar').fullCalendar('render');
			// },300);
		},100);

		return false;
	},

	longtap_option: function(ev){
		
		// Clicked an option
		// - take an action on the Thread
		var that = this,
			elem = ev.currentTarget;

		// Valid?
		if($(elem).hasClass('ignore')){
			return false;
		}

		// Get "wait" selected
		var waitType = $(elem).attr('data-type');

		var save_text = $.trim($(elem).text());

		// Get delay options (later today, etc.)
		var delay_options = App.Plugins.Minimail.getDelayOptions();
		
		// Get option from delay_options
		var wait = null,
			tmp_delay = null;
		$.each(delay_options,function(i,val){
			
			if(waitType == val.key){
				// using this one
				wait = val.wait;
				tmp_delay = val;
			}
		});
		if(wait == null){
			// alert('Invalid type used');
			this.close();
			return;
		}

		// Set values for time scroller
		var parsedScrollValues = App.Plugins.Minimail.formatTimeForScroll(wait);
		this.timeScroll.mobiscroll('setValue',parsedScrollValues,true);

		// Set calender datetime to wait value, track it
		that.wait_time = wait;
		that.wait_date = wait.toString('yyyy-MM-dd');

		// Trigger date confirmation
		window.setTimeout(function(){
			that.$('.options').addClass('nodisplay');
			that.$('.choose_datetime').removeClass('nodisplay');
		
			// Full calendar
			$('#calendar').fullCalendar({
				// put your options and callbacks here
				// defaultView: 'month',
				selectable: false,
				dayClick: function(date) {
					// Update date we want to use
					that.wait_date = date.toString('yyyy-MM-dd');

					// Select that date on calendar
					// - remove any other ones
					updateCalendarSelection();

				}
			});

			$('#calendar').find('.fc-button').on('click',function(){
				// Update selected date if changing months
				updateCalendarSelection();
			});

			// Goto correct date with calendar
			$('#calendar').fullCalendar('gotoDate',wait);

			
			// Create update calendar function
			var updateCalendarSelection = function(){
				$('#calendar td[data-date]').removeClass('fc-state-highlight');
				$('#calendar td[data-date="'+ that.wait_date +'"]').addClass('fc-state-highlight'); // [data-date="2013-03-27"]
			}

			// Select the correct datetime
			updateCalendarSelection();

			// Add button class (hacky)
			$('.fc-button').addClass('btn');

		},100);

		return false;
	},

	click_option: function(ev){
		// // Clicked an option
		// // - take an action on the Thread
		// var that = this;
		// var elem = ev.currentTarget;

		// // Valid?
		// if($(elem).hasClass('ignore')){
		// 	return false;
		// }

		// // Pick a date?
		// if($(elem).hasClass('pickadate')){
		// 	// Let pick continue to datepicker
		// 	// - auto-triggers the datepicker on Android/iOS

		// 	// listen for end of date picker
		// 	// clog('TRIGGERED');
		// 	// // $(elem).find('input').trigger('click');
		// 	// $(elem).find('input').focus();
		// 	// clog('did it');
		// 	return;
		// }

		// // Get "wait" selected
		// var waitType = $(elem).attr('data-type');

		// var save_text = $.trim($(elem).text());

		// // Get delay options (later today, etc.)
		// var delay_options = App.Plugins.Minimail.getDelayOptions();
		
		// // Get option from delay_options
		// var wait = null,
		// 	tmp_delay = null;
		// $.each(delay_options,function(i,val){
			
		// 	if(waitType == val.key){
		// 		// using this one
		// 		wait = val.wait;
		// 		// tmp_delay = val;
		// 	}
		// });
		// if(wait == null){
		// 	// alert('Invalid type used');
		// 	this.close();
		// 	return;
		// }

		// // Date
		// // var arr = this.$("#date").mobiscroll().parseValue(wait);
		// // console.log('hello');
		
		// // // var mobi_inst = $('#date').mobiscroll('getInst');
		// // var parsedScrollValues = App.Plugins.Minimail.formatDateForScroll(wait);
		// // this.dateScroll.mobiscroll('setValue',parsedScrollValues,true);

		// var parsedScrollValues = App.Plugins.Minimail.formatDateForScroll(wait);
		// this.timeScroll.mobiscroll('setValue',parsedScrollValues,true);

		// // Trigger date confirmation
		// window.setTimeout(function(){
		// 	that.$('.options').addClass('nodisplay');
		// 	that.$('.choose_datetime').removeClass('nodisplay');
		
		// 	// Full calendar
		// 	$('#calendar').fullCalendar({
		// 		// put your options and callbacks here
		// 		// defaultView: 'month',
		// 		dayClick: function(date) {
		// 			// Select that date on calendar
		// 			$('.fc-state-highlight').removeClass('fc-state-highlight');
		// 			$(this).addClass('fc-state-highlight');
		// 		}
		// 	});

		// 	// Add button class (hacky)
		// 	$('.fc-button').addClass('btn');

		// 	// // $('.fc-button-today').click();
		// 	// window.setTimeout(function(){
		// 	// 	// $('#calendar').fullCalendar('today');
		// 	// 	// $('.fc-button-today').trigger('click');
		// 	// 	$('#calendar').fullCalendar('render');
		// 	// },300);
		// },100);


		// // mobi_inst.val(wait.toString());
		// // console.log(1);
		// // console.log(mobi_inst.parseValue(wait));

		// // time
		// // this.$("#time").mobiscroll().time({
		// // 	display: 'inline',
		// // 	theme: 'wp'
		// // });

		// // $('#pickadate').click();

		// // Save delay
		// // - triggers other actions
		// // that.save_delay(wait, save_text);

		// return false;

	},

	cancel_confirmation: function(ev){
		// Cancelled choosing datetime
		// - return to 
		var that = this,
			elem = ev.currentTarget;

		// Swap classes
		this.$('.options').removeClass('nodisplay');
		this.$('.choose_datetime').addClass('nodisplay');

		// No calendar
		$('#calendar').html('');

		return false;
	},

	choose_confirmation: function(ev){
		// Confirmed a delay
		var that = this,
			elem = ev.currentTarget;

		// Get the time from the time scroller
		var wait_time = App.Plugins.Minimail.parseTimeFromScroll(that.timeScroll.mobiscroll('getValue'));

		// Get the date from the calendar
		// - stored in View
		var wait_date = Date.parse(that.wait_date);

		// Merge wait_time and wait_date together to form wait_datetime (complete datetime)
		var wait = new Date(wait_date.getFullYear(), wait_date.getMonth(), wait_date.getDate(), wait_time.getHours(), wait_time.getMinutes(), wait_time.getSeconds());
		
		// var save_text = wait.toString('ddd, MMM d');
		var save_text = wait.toString('ddd, MMM d') + '<br />' + wait.toString('h:mmtt');

		// Today?
		if(new Date(wait).clearTime().toString() == new Date().clearTime().toString()){
			save_text = 'Today<br />' + wait.toString('h:mmtt');
		}

		// Tomorrow?
		if(new Date(wait).clearTime().toString() == new Date().addDays(1).clearTime().toString()){
			save_text = 'Tomorrow<br />' + wait.toString('h:mmtt');
		}

		// save_text += '<br />' + wait.toString('h:mmtt');

		// save_text += wait.toString(' hmmtt');

		// Save delay
		that.save_delay(wait, save_text.toString());

		return false;

	},

	picked_date: function(ev){
		var that = this;
		var elem = ev.currentTarget;

		// Doesn't get here if date selecting is canceled
		// - no handler for "cancel" needed

		// get wait datetime
		// - convert to a datetime
		var wait = new Date($(elem).val());
		// clog('wait');
		// clog(wait);

		// Save delay
		// - triggers other actions
		that.save_delay(wait, 'The Future');

		return false;
	},

	modify_date: function(ev){
		// trigger by longtap on the element

		// Hide everything else and show the calendar

		return false;
	},

	save_delay: function(wait, save_text){
		// Save the delay
		// - or return the result to the calling function, if it exists
		var that = this;

		// Check for onComplete function
		if(this.options.onComplete){
			this.options.onComplete(wait,save_text);
		} else {

			// Update view
			$(this.threadView).find('.thread-bg-time p').html(save_text);
			$(this.threadView).addClass('finished');

			// Save delay
			var now_sec = parseInt(new Date().getTime() / 1000);
			var delay_time = wait.getTime() / 1000;

			var delay_seconds = parseInt(delay_time - now_sec);
			var in_seconds = now_sec + delay_seconds;

			App.Plugins.Minimail.saveNewDelay(this.threadid,in_seconds,delay_seconds);
		}

		// Close view
		this.close();

	},

	render: function() {
		var that = this;

		// Remove any previous version
		$('#delay_modal').remove();
		$('#calendar').remove(); // if exists

		// Build from template
		var template = App.Utils.template('t_delay_modal');

		// Get delay options (later today, etc.)
		var delay_options = App.Plugins.Minimail.getDelayOptions();

		// Write HTML
		this.$el.html(template({
			delay_options: delay_options
		}));

		// // Date-time scroller/picker
		// this.dateScroll = this.$("#date").mobiscroll().datetime({
		// 	display: 'inline',
		// 	theme: 'jqm'
		// });

		// (only) Time scroller/picker
		this.timeScroll = this.$("#time").mobiscroll().time({
			display: 'inline',
			theme: 'wp',
			mode: 'mixed',
			stepMinute: 15,
			timeFormat: 'h:ii a'
		});

		// Bind to back button
		// - bubbles previous ones lower (only 1 at a time allowed to bind to the back button)
		// - move this to the Backbone.Views (extend it)
		this.backbuttonBind = App.Utils.BackButton.newEnforcer(this.cancel);

		// Turn on tap watching

		App.Utils.WatchCustomTap(that.$('.option'));

		return this;
	}

});


