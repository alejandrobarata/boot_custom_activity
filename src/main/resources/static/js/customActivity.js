'use strict';

define(function (require) {
  var Postmonger = require('postmonger');

  var connection = new Postmonger.Session();
  var payload = {};
  var eventDefinitionKey = '';
  var steps = [
    // initialize to the same value as what's set in config.json for consistency
    { label: 'Código plantilla', key: 'step1' },
  ];
  var currentStep = steps[0].key;

  var canal = '';
  var codigoPlantilla = '';

  $(window).ready(onRender);

  connection.on('initActivity', initialize);
  connection.on('requestedTokens', onGetTokens);
  connection.on('requestedEndpoints', onGetEndpoints);

  connection.on('clickedNext', onClickedNext);
  // connection.on('clickedBack', onClickedBack);
  connection.on('gotoStep', onGotoStep);

  connection.on('requestedInteraction', requestedInteractionHandler);

  function onRender() {
    // JB will respond the first time 'ready' is called with 'initActivity'
    connection.trigger('ready');

    connection.trigger('requestInteraction');

    // connection.trigger('requestTokens');
    // connection.trigger('requestEndpoints');

    // Disable the next button if a value isn't selected
    $('#codigo').change(function () {
      codigo = getSelect('codigo');

      connection.trigger('updateButton', {
        button: 'done',
        enabled: Boolean(codigo),
      });
    });
  }

  function initialize(data) {
    if (data) {
      payload = data;
    }

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
        if (key === 'codigoPlantilla') {
          codigoPlantilla = val;
        }
      });
    });

    // Load selects
    load_json_data(codigoPlantilla);

    // If there is no canal selected, disable the next button
    if (!codigoPlantilla) {
      showStep(null, 1);
      connection.trigger('updateButton', { button: 'done', enabled: false });
      // If there is a canal, skip to the summary step
    }
  }

  function onGetTokens(tokens) {
    // Response: tokens = { token: <legacy token>, fuel2token: <fuel api token> }
    //console.log('tokens ==> ' + tokens);
  }

  function onGetEndpoints(endpoints) {
    // Response: endpoints = { restHost: <url> } i.e. "rest.s1.qa1.exacttarget.com"
    //console.log('endpoints ==> ' + endpoints);
  }

  function onClickedNext() {
    save();
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
          button: 'done',
          enabled: Boolean(getSelect('codigo')),
        });
        break;
    }
  }

  function requestedInteractionHandler(settings) {
    // console.log(JSON.stringify(settings));
    eventDefinitionKey = settings.triggers[0].metaData.eventDefinitionKey;
  }

  function save() {
    // var name = $('#canal').find('option:selected').html();

    // 'payload' is initialized on 'initActivity' above.
    // Journey Builder sends an initial payload with defaults
    // set by this activity's config.json file.  Any property
    // may be overridden as desired.
    // payload.name = name;

    payload['arguments'].execute.inArguments = [
      {
        canal: canal,
      },
      {
        codigoPlantilla: codigoPlantilla,
      },
      {
        emailAddress: '{{InteractionDefaults.Email}}',
      },
      {
        codigoPostal: '{{Event.' + eventDefinitionKey + '."CodigoPostal"}}',
      },
    ];

    payload['metaData'].isConfigured = true;

    connection.trigger('updateActivity', payload);
  }

  function getSelect(id) {
    return $('#' + id)
      .find('option:selected')
      .attr('value')
      .trim();
  }

  function load_json_data(currentValue) {
    var html_code = '';
    $.getJSON('data.json', function (data) {
      html_code += '<option value="">--</option>';
      $.each(data, function (key, value) {
        html_code +=
          '<option value="' + value.id + '">' + value.name + '</option>';
        if (!canal) {
          canal = value.canal;
        }
      });

      $('#' + id).html(html_code);
      if (currentValue) {
        $('#' + id)
          .find('option[value=' + currentValue + ']')
          .attr('selected', 'selected');
      }
    });
  }
});
