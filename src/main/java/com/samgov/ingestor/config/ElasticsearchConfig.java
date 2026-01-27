package com.samgov.ingestor.config;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Configuration;
import org.springframework.data.elasticsearch.client.ClientConfiguration;
import org.springframework.data.elasticsearch.client.elc.ElasticsearchConfiguration;
import org.springframework.data.elasticsearch.repository.config.EnableElasticsearchRepositories;

/**
 * Configuration for Elasticsearch client connection.
 *
 * Uses Spring Data Elasticsearch with the new Elasticsearch Java Client.
 * Connection URI is configurable via environment variable ELASTICSEARCH_URI.
 */
@Configuration
@EnableElasticsearchRepositories(basePackages = "com.samgov.ingestor.elasticsearch")
public class ElasticsearchConfig extends ElasticsearchConfiguration {

    @Value("${spring.elasticsearch.uris:http://localhost:9200}")
    private String elasticsearchUri;

    @Override
    public ClientConfiguration clientConfiguration() {
        String host = elasticsearchUri.replace("http://", "").replace("https://", "");

        ClientConfiguration.MaybeSecureClientConfigurationBuilder builder =
            ClientConfiguration.builder()
                .connectedTo(host);

        // Use SSL if https is specified
        if (elasticsearchUri.startsWith("https://")) {
            builder.usingSsl();
        }

        return builder
            .withConnectTimeout(java.time.Duration.ofSeconds(10))
            .withSocketTimeout(java.time.Duration.ofSeconds(30))
            .build();
    }
}
