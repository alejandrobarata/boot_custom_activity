package com.boot.consumingrest;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;

import lombok.Data;

@Data
@JsonIgnoreProperties(ignoreUnknown = true)
public class Quote {

    private String type;
    private Value value;

    @Override
    public String toString() {
        return "Quote{" + "type='" + type + '\'' + ", value=" + value + '}';
    }
}