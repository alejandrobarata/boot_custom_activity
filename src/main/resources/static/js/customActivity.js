'use strict';

define(function (require) {
  var Postmonger = require('postmonger');

  var connection = new Postmonger.Session();
  var payload = {};
  var eventDefinitionKey = '';
  var steps = [
    // initialize to the same value as what's set in config.json for consistency
    { label: 'Canal', key: 'step1' },
    { label: 'Código plantilla', key: 'step2' },
    { label: 'Info', key: 'step3' },
  ];
  var currentStep = steps[0].key;

  var canal = '';
  var tipo_documento = '';
  var mapData = new Map();

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
    $('#canal').change(function () {
      canal = getSelect('canal');

      connection.trigger('updateButton', {
        button: 'next',
        enabled: Boolean(canal),
      });

      if (canal != '') {
        loadDataSelect('codigo', canal);
      } else {
        $('#codigo').html('<option value="">--</option>');
      }

      $('#canalTexto').html(canal);
    });

    // Disable the next button if a value isn't selected
    $('#codigo').change(function () {
      tipo_documento = getSelect('codigo');

      connection.trigger('updateButton', {
        button: 'next',
        enabled: Boolean(canal),
      });

      $('#codigoTexto').html(tipo_documento);
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
        if (key === 'canal') {
          canal = val;
        }
        if (key === 'tipo_documento') {
          tipo_documento = val;
        }
      });
    });

    // Load selects
    load_json_data('canal', canal);

    // If there is no canal selected, disable the next button
    if (!canal || !tipo_documento) {
      showStep(null, 1);
      connection.trigger('updateButton', { button: 'next', enabled: false });
      // If there is a canal, skip to the summary step
    } else {
      /*$('#canal')
        .find('option[value=' + canal + ']')
        .attr('selected', 'selected');

      $('#codigo')
        .find('option[value=' + codigo + ']')
        .attr('selected', 'selected');*/

      $('#canalTexto').html(canal);
      $('#codigoTexto').html(tipo_documento);

      showStep(null, 3);
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
          enabled: Boolean(getSelect('canal')),
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
        console.log(getSelect('codigo'));
        connection.trigger('updateButton', {
          button: 'next',
          text: 'next',
          visible: true,
          enabled: Boolean(getSelect('codigo')),
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
    // console.log(JSON.stringify(settings));
    eventDefinitionKey = settings.triggers[0].metaData.eventDefinitionKey;
  }

  function save() {
    var name = $('#canal').find('option:selected').html();

    // 'payload' is initialized on 'initActivity' above.
    // Journey Builder sends an initial payload with defaults
    // set by this activity's config.json file.  Any property
    // may be overridden as desired.
    payload.name = name;

    payload['arguments'].execute.inArguments = [
      {
        tipo_envio: 'POSTAL',
      },
      {
        canal: canal,
      },
      {
        tipo_documento: tipo_documento,
      },
      {
        codigoReferencia:
          '{{Event.' +
          eventDefinitionKey +
          '."comunicacion-comunicacion_ref"}}',
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

  function load_json_data(id, currentValue) {
    var html_code = '';
    $.getJSON('data.json', function (data) {
      html_code += '<option value="">--</option>';
      $.each(data, function (key, value) {
        if (value.parent_id == '0') {
          mapData.set(value.id, new Map());
          html_code +=
            '<option value="' + value.id + '">' + value.name + '</option>';
        } else {
          mapData.get(value.parent_id).set(value.id, value.name);
        }
      });

      $('#' + id).html(html_code);
      if (currentValue) {
        $('#' + id)
          .find('option[value=' + currentValue + ']')
          .attr('selected', 'selected');

        $('#' + id).trigger('change');
      }
    });
  }

  function loadDataSelect(id, parent_id) {
    var html_code = '<option value="">--</option>';
    if (mapData.has(parent_id)) {
      mapData.get(parent_id).forEach(function (value, key) {
        html_code += '<option value="' + key + '">' + value + '</option>';
      });

      $('#' + id).html(html_code);
    }
  }
});
