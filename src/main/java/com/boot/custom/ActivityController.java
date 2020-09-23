package com.boot.custom;

import java.util.Map;

import com.boot.consumingrest.Quote;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.client.RestTemplate;

@RestController
@RequestMapping("/activity")
public class ActivityController {

    private static final Logger log = LoggerFactory.getLogger(ActivityController.class);

    @PostMapping("/save")
    public ResponseEntity<String> save(@RequestBody Map<String, Object> payload) {
        System.out.println("save");
        System.out.println(payload);
        return new ResponseEntity<>("Save", HttpStatus.OK);
    }

    @PostMapping("/publish")
    public ResponseEntity<String> publish(@RequestBody Map<String, Object> payload) {
        System.out.println("publish");
        System.out.println(payload);
        return new ResponseEntity<>("Publish", HttpStatus.OK);
    }

    @PostMapping("/validate")
    public ResponseEntity<String> validate(@RequestBody Map<String, Object> payload) {
        System.out.println("validate");
        System.out.println(payload);
        return new ResponseEntity<>("Validate", HttpStatus.OK);
    }

    @PostMapping("/stop")
    public ResponseEntity<String> stop(@RequestBody Map<String, Object> payload) {
        System.out.println("stop");
        System.out.println(payload);
        return new ResponseEntity<>("Stop", HttpStatus.OK);
    }

    @PostMapping("/execute")
    public ActivityResult execute(@RequestBody ExecutePayload payload) {
        System.out.println(payload);
        String canal;
        String codigoPlantilla;
        String codigoPostal;
        for (Map<String, String> inArgument : payload.getInArguments()) {
            if (inArgument.containsKey("codigoPostal")) {
                codigoPostal = inArgument.get("codigoPostal");
            }
            if (inArgument.containsKey("canal")) {
                canal = inArgument.get("canal");
            }
            if (inArgument.containsKey("codigoPlantilla")) {
                codigoPlantilla = inArgument.get("codigoPlantilla");
            }
        }

        RestTemplate restTemplate = new RestTemplate();
        Quote quote = restTemplate.getForObject("https://gturnquist-quoters.cfapps.io/api/random", Quote.class);
        log.info(quote.toString());

        return new ActivityResult("false");
    }
}
