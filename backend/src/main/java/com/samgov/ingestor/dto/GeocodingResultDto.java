package com.samgov.ingestor.dto;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.fasterxml.jackson.annotation.JsonProperty;

import java.math.BigDecimal;
import java.util.List;
import java.util.Map;

/**
 * DTOs for Census Geocoder API responses.
 */
public class GeocodingResultDto {

    /**
     * Top-level response from geocoder.
     */
    @JsonIgnoreProperties(ignoreUnknown = true)
    public record GeocoderResponse(
            @JsonProperty("result") GeocoderResult result
    ) {}

    /**
     * Result containing input and address matches.
     */
    @JsonIgnoreProperties(ignoreUnknown = true)
    public record GeocoderResult(
            @JsonProperty("input") GeocoderInput input,
            @JsonProperty("addressMatches") List<AddressMatch> addressMatches
    ) {
        public boolean hasMatches() {
            return addressMatches != null && !addressMatches.isEmpty();
        }

        public AddressMatch getBestMatch() {
            return hasMatches() ? addressMatches.get(0) : null;
        }
    }

    /**
     * Input address that was geocoded.
     */
    @JsonIgnoreProperties(ignoreUnknown = true)
    public record GeocoderInput(
            @JsonProperty("address") Map<String, String> address,
            @JsonProperty("benchmark") BenchmarkInfo benchmark
    ) {}

    /**
     * Benchmark metadata.
     */
    @JsonIgnoreProperties(ignoreUnknown = true)
    public record BenchmarkInfo(
            @JsonProperty("id") String id,
            @JsonProperty("benchmarkName") String benchmarkName,
            @JsonProperty("benchmarkDescription") String benchmarkDescription,
            @JsonProperty("isDefault") boolean isDefault
    ) {}

    /**
     * A matched address with coordinates and geographies.
     */
    @JsonIgnoreProperties(ignoreUnknown = true)
    public record AddressMatch(
            @JsonProperty("matchedAddress") String matchedAddress,
            @JsonProperty("coordinates") Coordinates coordinates,
            @JsonProperty("tigerLine") TigerLine tigerLine,
            @JsonProperty("addressComponents") AddressComponents addressComponents,
            @JsonProperty("geographies") Map<String, List<Geography>> geographies
    ) {
        /**
         * Get the state FIPS code from geographies.
         */
        public String getStateFips() {
            if (geographies == null) return null;
            List<Geography> states = geographies.get("States");
            if (states != null && !states.isEmpty()) {
                return states.get(0).state();
            }
            return null;
        }

        /**
         * Get the county FIPS code from geographies.
         */
        public String getCountyFips() {
            if (geographies == null) return null;
            List<Geography> counties = geographies.get("Counties");
            if (counties != null && !counties.isEmpty()) {
                Geography county = counties.get(0);
                return county.state() + county.county();
            }
            return null;
        }

        /**
         * Get the census tract from geographies.
         */
        public String getCensusTract() {
            if (geographies == null) return null;
            List<Geography> tracts = geographies.get("Census Tracts");
            if (tracts != null && !tracts.isEmpty()) {
                return tracts.get(0).tract();
            }
            return null;
        }
    }

    /**
     * Latitude/longitude coordinates.
     */
    @JsonIgnoreProperties(ignoreUnknown = true)
    public record Coordinates(
            @JsonProperty("x") BigDecimal longitude,
            @JsonProperty("y") BigDecimal latitude
    ) {}

    /**
     * TIGER/Line information.
     */
    @JsonIgnoreProperties(ignoreUnknown = true)
    public record TigerLine(
            @JsonProperty("tigerLineId") String tigerLineId,
            @JsonProperty("side") String side
    ) {}

    /**
     * Parsed address components.
     */
    @JsonIgnoreProperties(ignoreUnknown = true)
    public record AddressComponents(
            @JsonProperty("fromAddress") String fromAddress,
            @JsonProperty("toAddress") String toAddress,
            @JsonProperty("preQualifier") String preQualifier,
            @JsonProperty("preDirection") String preDirection,
            @JsonProperty("preType") String preType,
            @JsonProperty("streetName") String streetName,
            @JsonProperty("suffixType") String suffixType,
            @JsonProperty("suffixDirection") String suffixDirection,
            @JsonProperty("suffixQualifier") String suffixQualifier,
            @JsonProperty("city") String city,
            @JsonProperty("state") String state,
            @JsonProperty("zip") String zip
    ) {}

    /**
     * Geography entity (state, county, tract, etc.).
     */
    @JsonIgnoreProperties(ignoreUnknown = true)
    public record Geography(
            @JsonProperty("GEOID") String geoId,
            @JsonProperty("CENTLAT") String centLat,
            @JsonProperty("CENTLON") String centLon,
            @JsonProperty("AREALAND") Long areaLand,
            @JsonProperty("AREAWATER") Long areaWater,
            @JsonProperty("NAME") String name,
            @JsonProperty("LSAD") String lsad,
            @JsonProperty("FUNCSTAT") String funcStat,
            @JsonProperty("STATE") String state,
            @JsonProperty("COUNTY") String county,
            @JsonProperty("TRACT") String tract,
            @JsonProperty("BLKGRP") String blockGroup
    ) {}

    /**
     * Simplified geocoding result for application use.
     */
    public record SimpleGeocodingResult(
            String matchedAddress,
            BigDecimal latitude,
            BigDecimal longitude,
            String stateFips,
            String countyFips,
            String censusTract,
            String city,
            String state,
            String zip
    ) {
        public static SimpleGeocodingResult from(AddressMatch match) {
            if (match == null) return null;

            Coordinates coords = match.coordinates();
            AddressComponents components = match.addressComponents();

            return new SimpleGeocodingResult(
                    match.matchedAddress(),
                    coords != null ? coords.latitude() : null,
                    coords != null ? coords.longitude() : null,
                    match.getStateFips(),
                    match.getCountyFips(),
                    match.getCensusTract(),
                    components != null ? components.city() : null,
                    components != null ? components.state() : null,
                    components != null ? components.zip() : null
            );
        }

        public boolean isValid() {
            return latitude != null && longitude != null;
        }
    }
}
