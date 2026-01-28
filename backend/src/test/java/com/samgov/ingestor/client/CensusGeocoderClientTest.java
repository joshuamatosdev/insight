package com.samgov.ingestor.client;

import com.samgov.ingestor.config.CensusProperties;
import com.samgov.ingestor.dto.GeocodingResultDto.*;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Nested;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.junit.jupiter.MockitoExtension;

import java.math.BigDecimal;
import java.util.List;
import java.util.Map;

import static org.assertj.core.api.Assertions.assertThat;

/**
 * Unit tests for CensusGeocoderClient.
 * Tests DTO parsing, configuration, and result processing.
 */
@ExtendWith(MockitoExtension.class)
class CensusGeocoderClientTest {

    private CensusGeocoderClient client;
    private CensusProperties properties;

    @BeforeEach
    void setUp() {
        properties = new CensusProperties();
        properties.setEnabled(true);
        properties.setGeocoderUrl("https://geocoding.geo.census.gov/geocoder");
        properties.setRateLimitMs(100);
        properties.setBenchmark("Public_AR_Current");
        properties.setVintage("Current_Current");
        properties.setBatchSize(100);

        client = new CensusGeocoderClient(properties);
    }

    @Nested
    @DisplayName("isEnabled")
    class IsEnabled {

        @Test
        @DisplayName("should return true when enabled in properties")
        void shouldReturnTrueWhenEnabled() {
            assertThat(client.isEnabled()).isTrue();
        }

        @Test
        @DisplayName("should return false when disabled in properties")
        void shouldReturnFalseWhenDisabled() {
            properties.setEnabled(false);
            CensusGeocoderClient disabledClient = new CensusGeocoderClient(properties);
            assertThat(disabledClient.isEnabled()).isFalse();
        }
    }

    @Nested
    @DisplayName("Properties Configuration")
    class PropertiesConfiguration {

        @Test
        @DisplayName("should use configured benchmark")
        void shouldUseConfiguredBenchmark() {
            assertThat(properties.getBenchmark()).isEqualTo("Public_AR_Current");
        }

        @Test
        @DisplayName("should use configured vintage")
        void shouldUseConfiguredVintage() {
            assertThat(properties.getVintage()).isEqualTo("Current_Current");
        }

        @Test
        @DisplayName("should use configured rate limit")
        void shouldUseConfiguredRateLimit() {
            assertThat(properties.getRateLimitMs()).isEqualTo(100);
        }

        @Test
        @DisplayName("should use configured batch size")
        void shouldUseConfiguredBatchSize() {
            assertThat(properties.getBatchSize()).isEqualTo(100);
        }
    }

    @Nested
    @DisplayName("DTO Parsing")
    class DtoParsing {

        @Test
        @DisplayName("should correctly parse Coordinates")
        void shouldParseCoordinates() {
            Coordinates coords = new Coordinates(
                new BigDecimal("-77.0369"),   // longitude (x)
                new BigDecimal("38.9072")     // latitude (y)
            );

            assertThat(coords.longitude()).isEqualByComparingTo(new BigDecimal("-77.0369"));
            assertThat(coords.latitude()).isEqualByComparingTo(new BigDecimal("38.9072"));
        }

        @Test
        @DisplayName("should correctly parse AddressComponents")
        void shouldParseAddressComponents() {
            AddressComponents components = new AddressComponents(
                "1600",           // fromAddress
                "1698",           // toAddress
                null,             // preQualifier
                "NW",             // preDirection
                null,             // preType
                "PENNSYLVANIA",   // streetName
                "AVE",            // suffixType
                null,             // suffixDirection
                null,             // suffixQualifier
                "WASHINGTON",     // city
                "DC",             // state
                "20500"           // zip
            );

            assertThat(components.streetName()).isEqualTo("PENNSYLVANIA");
            assertThat(components.city()).isEqualTo("WASHINGTON");
            assertThat(components.state()).isEqualTo("DC");
            assertThat(components.zip()).isEqualTo("20500");
        }

        @Test
        @DisplayName("should correctly parse Geography")
        void shouldParseGeography() {
            Geography geography = new Geography(
                "11001",          // geoId
                "38.9072",        // centLat
                "-77.0369",       // centLon
                158364985L,       // areaLand
                18633403L,        // areaWater
                "District of Columbia", // name
                "25",             // lsad
                "A",              // funcStat
                "11",             // state
                "001",            // county
                "000100",         // tract
                null              // blockGroup
            );

            assertThat(geography.geoId()).isEqualTo("11001");
            assertThat(geography.name()).isEqualTo("District of Columbia");
            assertThat(geography.state()).isEqualTo("11");
            assertThat(geography.county()).isEqualTo("001");
            assertThat(geography.tract()).isEqualTo("000100");
        }

        @Test
        @DisplayName("should correctly parse AddressMatch")
        void shouldParseAddressMatch() {
            Coordinates coords = new Coordinates(
                new BigDecimal("-77.0369"),
                new BigDecimal("38.9072")
            );

            AddressComponents components = new AddressComponents(
                "1600", "1698", null, "NW", null,
                "PENNSYLVANIA", "AVE", null, null,
                "WASHINGTON", "DC", "20500"
            );

            Geography stateGeo = new Geography(
                "11", null, null, null, null,
                "District of Columbia", null, null,
                "11", null, null, null
            );

            Geography countyGeo = new Geography(
                "11001", null, null, null, null,
                "District of Columbia", null, null,
                "11", "001", null, null
            );

            Geography tractGeo = new Geography(
                "11001000100", null, null, null, null,
                "Census Tract 1", null, null,
                "11", "001", "000100", null
            );

            Map<String, List<Geography>> geographies = Map.of(
                "States", List.of(stateGeo),
                "Counties", List.of(countyGeo),
                "Census Tracts", List.of(tractGeo)
            );

            AddressMatch match = new AddressMatch(
                "1600 PENNSYLVANIA AVE NW, WASHINGTON, DC, 20500",
                coords,
                new TigerLine("123456", "L"),
                components,
                geographies
            );

            assertThat(match.matchedAddress()).contains("PENNSYLVANIA");
            assertThat(match.getStateFips()).isEqualTo("11");
            assertThat(match.getCountyFips()).isEqualTo("11001");
            assertThat(match.getCensusTract()).isEqualTo("000100");
        }

        @Test
        @DisplayName("should return null FIPS codes when geographies missing")
        void shouldReturnNullWhenGeographiesMissing() {
            AddressMatch match = new AddressMatch(
                "123 Test Street",
                new Coordinates(new BigDecimal("-77"), new BigDecimal("38")),
                null,
                null,
                null  // No geographies
            );

            assertThat(match.getStateFips()).isNull();
            assertThat(match.getCountyFips()).isNull();
            assertThat(match.getCensusTract()).isNull();
        }

        @Test
        @DisplayName("should check if result has matches")
        void shouldCheckHasMatches() {
            GeocoderResult withMatches = new GeocoderResult(
                null,
                List.of(new AddressMatch("test", null, null, null, null))
            );

            GeocoderResult withoutMatches = new GeocoderResult(
                null,
                List.of()
            );

            GeocoderResult nullMatches = new GeocoderResult(
                null,
                null
            );

            assertThat(withMatches.hasMatches()).isTrue();
            assertThat(withoutMatches.hasMatches()).isFalse();
            assertThat(nullMatches.hasMatches()).isFalse();
        }

        @Test
        @DisplayName("should get best match from result")
        void shouldGetBestMatch() {
            AddressMatch match1 = new AddressMatch("First Match", null, null, null, null);
            AddressMatch match2 = new AddressMatch("Second Match", null, null, null, null);

            GeocoderResult result = new GeocoderResult(
                null,
                List.of(match1, match2)
            );

            assertThat(result.getBestMatch()).isEqualTo(match1);
        }

        @Test
        @DisplayName("should return null best match when no matches")
        void shouldReturnNullBestMatchWhenEmpty() {
            GeocoderResult result = new GeocoderResult(null, List.of());
            assertThat(result.getBestMatch()).isNull();
        }
    }

    @Nested
    @DisplayName("SimpleGeocodingResult")
    class SimpleGeocodingResultTests {

        @Test
        @DisplayName("should create from AddressMatch")
        void shouldCreateFromAddressMatch() {
            Coordinates coords = new Coordinates(
                new BigDecimal("-77.0369"),
                new BigDecimal("38.9072")
            );

            AddressComponents components = new AddressComponents(
                null, null, null, null, null,
                null, null, null, null,
                "WASHINGTON", "DC", "20500"
            );

            Geography stateGeo = new Geography(
                null, null, null, null, null, null, null, null,
                "11", null, null, null
            );

            Geography countyGeo = new Geography(
                null, null, null, null, null, null, null, null,
                "11", "001", null, null
            );

            Geography tractGeo = new Geography(
                null, null, null, null, null, null, null, null,
                null, null, "000100", null
            );

            AddressMatch match = new AddressMatch(
                "1600 PENNSYLVANIA AVE NW, WASHINGTON, DC, 20500",
                coords,
                null,
                components,
                Map.of(
                    "States", List.of(stateGeo),
                    "Counties", List.of(countyGeo),
                    "Census Tracts", List.of(tractGeo)
                )
            );

            SimpleGeocodingResult result = SimpleGeocodingResult.from(match);

            assertThat(result).isNotNull();
            assertThat(result.matchedAddress()).isEqualTo("1600 PENNSYLVANIA AVE NW, WASHINGTON, DC, 20500");
            assertThat(result.latitude()).isEqualByComparingTo(new BigDecimal("38.9072"));
            assertThat(result.longitude()).isEqualByComparingTo(new BigDecimal("-77.0369"));
            assertThat(result.stateFips()).isEqualTo("11");
            assertThat(result.countyFips()).isEqualTo("11001");
            assertThat(result.censusTract()).isEqualTo("000100");
            assertThat(result.city()).isEqualTo("WASHINGTON");
            assertThat(result.state()).isEqualTo("DC");
            assertThat(result.zip()).isEqualTo("20500");
        }

        @Test
        @DisplayName("should return null when AddressMatch is null")
        void shouldReturnNullFromNullMatch() {
            SimpleGeocodingResult result = SimpleGeocodingResult.from(null);
            assertThat(result).isNull();
        }

        @Test
        @DisplayName("should validate result has coordinates")
        void shouldValidateCoordinates() {
            SimpleGeocodingResult valid = new SimpleGeocodingResult(
                "test", new BigDecimal("38"), new BigDecimal("-77"),
                "11", "11001", "000100", "DC", "DC", "20001"
            );

            SimpleGeocodingResult invalidLat = new SimpleGeocodingResult(
                "test", null, new BigDecimal("-77"),
                "11", "11001", "000100", "DC", "DC", "20001"
            );

            SimpleGeocodingResult invalidLon = new SimpleGeocodingResult(
                "test", new BigDecimal("38"), null,
                "11", "11001", "000100", "DC", "DC", "20001"
            );

            assertThat(valid.isValid()).isTrue();
            assertThat(invalidLat.isValid()).isFalse();
            assertThat(invalidLon.isValid()).isFalse();
        }
    }

    @Nested
    @DisplayName("Geocode Address Validation")
    class GeocodeAddressValidation {

        @Test
        @DisplayName("should return null for null address")
        void shouldReturnNullForNullAddress() {
            SimpleGeocodingResult result = client.geocodeAddress(null);
            assertThat(result).isNull();
        }

        @Test
        @DisplayName("should return null for blank address")
        void shouldReturnNullForBlankAddress() {
            SimpleGeocodingResult result = client.geocodeAddress("   ");
            assertThat(result).isNull();
        }

        @Test
        @DisplayName("should return null when disabled")
        void shouldReturnNullWhenDisabled() {
            properties.setEnabled(false);
            CensusGeocoderClient disabledClient = new CensusGeocoderClient(properties);
            SimpleGeocodingResult result = disabledClient.geocodeAddress("1600 Pennsylvania Ave NW, Washington, DC");
            assertThat(result).isNull();
        }
    }
}
