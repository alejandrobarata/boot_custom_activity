package com.boot.consumingrest;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;

import lombok.Data;

@Data
@JsonIgnoreProperties(ignoreUnknown = true)
public class Quote {

    private Integer id;

    @Override
    public String toString() {
        return "Quote{id=" + id + "}";
    }
}