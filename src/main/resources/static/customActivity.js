'use strict';

define(function (require) {
  var Postmonger = require('postmonger');

  var connection = new Postmonger.Session();
  var payload = {};
  var lastStepEnabled = false;
  var steps = [
    // initialize to the same value as what's set in config.json for consistency
    { label: 'Canal', key: 'step1' },
    { label: 'Step 2', key: 'step2' },
    { label: 'Info', key: 'step3' },
  ];
  var currentStep = steps[0].key;

  $(window).ready(onRender);

  connection.on('initActivity', initialize);
  connection.on('requestedTokens', onGetTokens);
  connection.on('requestedEndpoints', onGetEndpoints);

  connection.on('clickedNext', onClickedNext);
  connection.on('clickedBack', onClickedBack);
  connection.on('gotoStep', onGotoStep);

  connection.on('requestedInteraction', requestedInteractionHandler);

  function onRender() {
    // JB will respond the first time 'ready' is called with 'initActivity'
    connection.trigger('ready');

    connection.trigger('requestInteraction');

    // connection.trigger('requestTokens');
    // connection.trigger('requestEndpoints');

    // Disable the next button if a value isn't selected
    $('#select1').change(function () {
      var canal = getCanal();
      connection.trigger('updateButton', {
        button: 'next',
        enabled: Boolean(canal),
      });
      console.log('Boolean ==> ' + Boolean(canal));

      $('#canal').html(canal);
    });
  }

  function initialize(data) {
    if (data) {
      payload = data;
    }

    var canal;
    var hasInArguments = Boolean(
      payload['arguments'] &&
        payload['arguments'].execute &&
        payload['arguments'].execute.inArguments &&
        payload['arguments'].execute.inArguments.length > 0
    );

    var inArguments = hasInArguments
      ? payload['arguments'].execute.inArguments
      : {};

    $.each(inArguments, function (index, inArgument) {
      $.each(inArgument, function (key, val) {
        if (key === 'canal') {
          canal = val;
        }
      });
    });

    // If there is no canal selected, disable the next button
    if (!canal) {
      showStep(null, 1);
      connection.trigger('updateButton', { button: 'next', enabled: false });
      // If there is a canal, skip to the summary step
    } else {
      $('#select1')
        .find('option[value=' + canal + ']')
        .attr('selected', 'selected');
      $('#canal').html(canal);
      showStep(null, 3);
    }
  }

  function onGetTokens(tokens) {
    // Response: tokens = { token: <legacy token>, fuel2token: <fuel api token> }
    console.log('tokens ==> ' + tokens);
  }

  function onGetEndpoints(endpoints) {
    // Response: endpoints = { restHost: <url> } i.e. "rest.s1.qa1.exacttarget.com"
    console.log('endpoints ==> ' + endpoints);
  }

  function onClickedNext() {
    if (currentStep.key === 'step3') {
      save();
    } else {
      connection.trigger('nextStep');
    }
  }

  function onClickedBack() {
    connection.trigger('prevStep');
  }

  function onGotoStep(step) {
    showStep(step);
    connection.trigger('ready');
  }

  function showStep(step, stepIndex) {
    if (stepIndex && !step) {
      step = steps[stepIndex - 1];
    }

    currentStep = step;

    $('.step').hide();

    switch (currentStep.key) {
      case 'step1':
        $('#step1').show();
        connection.trigger('updateButton', {
          button: 'next',
          enabled: Boolean(getCanal()),
        });
        connection.trigger('updateButton', {
          button: 'back',
          visible: false,
        });
        break;
      case 'step2':
        $('#step2').show();
        connection.trigger('updateButton', {
          button: 'back',
          visible: true,
        });
        connection.trigger('updateButton', {
          button: 'next',
          text: 'next',
          visible: true,
        });
        break;
      case 'step3':
        $('#step3').show();
        connection.trigger('updateButton', {
          button: 'back',
          visible: true,
        });

        connection.trigger('updateButton', {
          button: 'next',
          text: 'done',
          visible: true,
        });

        break;
    }
  }

  function requestedInteractionHandler(settings) {
    try {
      /*eventDefinitionKey = settings.triggers[0].metaData.eventDefinitionKey;
      $('#select-entryevent-defkey').val(eventDefinitionKey);*/

      if (
        settings.triggers[0].type === 'SalesforceObjectTriggerV2' &&
        settings.triggers[0].configurationArguments &&
        settings.triggers[0].configurationArguments.eventDataConfig
      ) {
        // This workaround is necessary as Salesforce occasionally returns the eventDataConfig-object as string
        if (
          typeof settings.triggers[0].configurationArguments.eventDataConfig ===
            'string' ||
          !settings.triggers[0].configurationArguments.eventDataConfig.objects
        ) {
          settings.triggers[0].configurationArguments.eventDataConfig = JSON.parse(
            settings.triggers[0].configurationArguments.eventDataConfig
          );
        }

        settings.triggers[0].configurationArguments.eventDataConfig.objects.forEach(
          (obj) => {
            deFields = deFields.concat(
              obj.fields.map((fieldName) => {
                return obj.dePrefix + fieldName;
              })
            );
          }
        );

        deFields.forEach((option) => {
          $('#select-id-dropdown').append(
            $('<option>', {
              value: option,
              text: option,
            })
          );
        });

        $('#select-id').hide();
        $('#select-id-dropdown').show();
      } else {
        $('#select-id-dropdown').hide();
        $('#select-id').show();
      }
    } catch (e) {
      console.error(e);
      $('#select-id-dropdown').hide();
      $('#select-id').show();
    }
  }

  function save() {
    var name = $('#select1').find('option:selected').html();
    var value = getCanal();

    // 'payload' is initialized on 'initActivity' above.
    // Journey Builder sends an initial payload with defaults
    // set by this activity's config.json file.  Any property
    // may be overridden as desired.
    payload.name = name;

    payload['arguments'].execute.inArguments = [
      {
        canal: value,
      },
      {
        emailAddress: '{{InteractionDefaults.Email}}',
      },
      {
        codigoPostal: '{{Contact.Attribute.TestCA.CodigoPostal}}',
      },
    ];

    payload['metaData'].isConfigured = true;

    connection.trigger('updateActivity', payload);
  }

  function getCanal() {
    return $('#select1').find('option:selected').attr('value').trim();
  }
});
