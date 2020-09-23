package com.boot.custom;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/activity")
public class ActivityController {

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

        Map<String, String> inArgument = payload.getInArguments()[0];
        System.out.println(inArgument);

        for (Map<String, String> inArgumentAux : payload.getInArguments()) {
            System.out.println(inArgumentAux);
        }

        // System.out.println(inArgument.get(key));
        if (inArgument != null) {
            if (inArgument.containsKey("codigoPostal")) {
                System.out.println(inArgument.get("codigoPostal"));
            }
        }

        return new ActivityResult("false");
    }
}
