package com.boot.consumingrest;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;

import lombok.Data;

@Data
@JsonIgnoreProperties(ignoreUnknown = true)
public class Value {

    private Long id;
    private String quote;

    @Override
    public String toString() {
        return "Value{" + "id=" + id + ", quote='" + quote + '\'' + '}';
    }
}