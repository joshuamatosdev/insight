package com.samgov.ingestor.util;

import java.time.Instant;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.ZoneId;
import java.time.format.DateTimeFormatter;
import java.time.temporal.ChronoUnit;

public final class DateUtils {

    private static final ZoneId DEFAULT_ZONE = ZoneId.of("America/New_York");
    private static final DateTimeFormatter ISO_DATE = DateTimeFormatter.ISO_LOCAL_DATE;
    private static final DateTimeFormatter DISPLAY_DATE = DateTimeFormatter.ofPattern("MMM d, yyyy");
    private static final DateTimeFormatter DISPLAY_DATETIME = DateTimeFormatter.ofPattern("MMM d, yyyy h:mm a");

    private DateUtils() {}

    public static long daysUntil(LocalDate date) {
        if (date == null) return Long.MAX_VALUE;
        return ChronoUnit.DAYS.between(LocalDate.now(), date);
    }

    public static long daysUntil(Instant instant) {
        if (instant == null) return Long.MAX_VALUE;
        return ChronoUnit.DAYS.between(Instant.now(), instant);
    }

    public static long daysSince(LocalDate date) {
        if (date == null) return Long.MAX_VALUE;
        return ChronoUnit.DAYS.between(date, LocalDate.now());
    }

    public static long daysSince(Instant instant) {
        if (instant == null) return Long.MAX_VALUE;
        return ChronoUnit.DAYS.between(instant, Instant.now());
    }

    public static boolean isExpired(LocalDate date) {
        return date != null && date.isBefore(LocalDate.now());
    }

    public static boolean isExpired(Instant instant) {
        return instant != null && instant.isBefore(Instant.now());
    }

    public static boolean isExpiringSoon(LocalDate date, int daysThreshold) {
        if (date == null) return false;
        long daysUntil = daysUntil(date);
        return daysUntil >= 0 && daysUntil <= daysThreshold;
    }

    public static boolean isExpiringSoon(Instant instant, int daysThreshold) {
        if (instant == null) return false;
        long daysUntil = daysUntil(instant);
        return daysUntil >= 0 && daysUntil <= daysThreshold;
    }

    public static String formatDate(LocalDate date) {
        return date != null ? date.format(DISPLAY_DATE) : "";
    }

    public static String formatDateTime(Instant instant) {
        if (instant == null) return "";
        return LocalDateTime.ofInstant(instant, DEFAULT_ZONE).format(DISPLAY_DATETIME);
    }

    public static String formatIsoDate(LocalDate date) {
        return date != null ? date.format(ISO_DATE) : "";
    }

    public static LocalDate parseDate(String dateStr) {
        if (dateStr == null || dateStr.isEmpty()) return null;
        return LocalDate.parse(dateStr, ISO_DATE);
    }

    public static String urgencyLabel(LocalDate deadline) {
        if (deadline == null) return "No deadline";
        long days = daysUntil(deadline);
        if (days < 0) return "Overdue";
        if (days == 0) return "Due today";
        if (days == 1) return "Due tomorrow";
        if (days <= 7) return "Due in " + days + " days";
        if (days <= 30) return "Due in " + (days / 7) + " weeks";
        return "Due in " + (days / 30) + " months";
    }

    public static String urgencyLevel(LocalDate deadline) {
        if (deadline == null) return "none";
        long days = daysUntil(deadline);
        if (days < 0) return "overdue";
        if (days <= 3) return "critical";
        if (days <= 7) return "high";
        if (days <= 14) return "medium";
        return "low";
    }

    public static LocalDate startOfMonth() {
        return LocalDate.now().withDayOfMonth(1);
    }

    public static LocalDate endOfMonth() {
        return LocalDate.now().plusMonths(1).withDayOfMonth(1).minusDays(1);
    }

    public static LocalDate startOfQuarter() {
        LocalDate now = LocalDate.now();
        int quarterMonth = ((now.getMonthValue() - 1) / 3) * 3 + 1;
        return LocalDate.of(now.getYear(), quarterMonth, 1);
    }

    public static LocalDate endOfQuarter() {
        return startOfQuarter().plusMonths(3).minusDays(1);
    }

    public static LocalDate startOfYear() {
        return LocalDate.now().withDayOfYear(1);
    }

    public static LocalDate endOfYear() {
        return LocalDate.of(LocalDate.now().getYear(), 12, 31);
    }

    public static LocalDate fiscalYearStart() {
        LocalDate now = LocalDate.now();
        int year = now.getMonthValue() >= 10 ? now.getYear() : now.getYear() - 1;
        return LocalDate.of(year, 10, 1);
    }

    public static LocalDate fiscalYearEnd() {
        return fiscalYearStart().plusYears(1).minusDays(1);
    }
}
