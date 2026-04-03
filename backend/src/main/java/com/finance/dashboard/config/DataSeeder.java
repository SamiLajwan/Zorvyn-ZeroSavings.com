package com.finance.dashboard.config;

import com.finance.dashboard.entity.FinancialRecord;
import com.finance.dashboard.entity.User;
import com.finance.dashboard.repository.FinancialRecordRepository;
import com.finance.dashboard.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;

@Component
@RequiredArgsConstructor
public class DataSeeder implements CommandLineRunner {

    private final UserRepository userRepo;
    private final FinancialRecordRepository recordRepo;
    private final PasswordEncoder encoder;

    @Override
    public void run(String... args) {
        User admin   = createUser("admin",   "admin123",   "admin@finflow.in",   User.Role.ADMIN);
        User analyst = createUser("analyst", "analyst123", "analyst@finflow.in", User.Role.ANALYST);
                       createUser("viewer",  "viewer123",  "viewer@finflow.in",  User.Role.VIEWER);

        LocalDate today = LocalDate.now();

        List<Object[]> records = List.of(

            // ── April (current month) ──────────────────────────────────────
            new Object[]{ "Salary",           FinancialRecord.Type.INCOME,  new BigDecimal("72000"),  today.withDayOfMonth(1),  "Monthly salary — Rahul Sharma",        admin },
            new Object[]{ "Freelance",         FinancialRecord.Type.INCOME,  new BigDecimal("15000"),  today.withDayOfMonth(5),  "Web design project payment",           admin },
            new Object[]{ "Rent",              FinancialRecord.Type.EXPENSE, new BigDecimal("18000"),  today.withDayOfMonth(2),  "2BHK flat rent — Koramangala",         admin },
            new Object[]{ "Groceries",         FinancialRecord.Type.EXPENSE, new BigDecimal("4800"),   today.withDayOfMonth(4),  "Big Basket + local kirana",            admin },
            new Object[]{ "Home Loan EMI",     FinancialRecord.Type.EXPENSE, new BigDecimal("14500"),  today.withDayOfMonth(5),  "SBI home loan EMI",                    admin },
            new Object[]{ "LIC Premium",       FinancialRecord.Type.EXPENSE, new BigDecimal("3200"),   today.withDayOfMonth(6),  "LIC Jeevan Anand quarterly premium",   admin },
            new Object[]{ "Electricity Bill",  FinancialRecord.Type.EXPENSE, new BigDecimal("1850"),   today.withDayOfMonth(7),  "BESCOM bill — April",                  admin },
            new Object[]{ "Mobile & Internet", FinancialRecord.Type.EXPENSE, new BigDecimal("999"),    today.withDayOfMonth(8),  "Jio postpaid + broadband",             admin },
            new Object[]{ "School Fees",       FinancialRecord.Type.EXPENSE, new BigDecimal("6500"),   today.withDayOfMonth(9),  "Children school fees — Q1",            admin },
            new Object[]{ "Petrol",            FinancialRecord.Type.EXPENSE, new BigDecimal("2400"),   today.withDayOfMonth(10), "Bike + car fuel",                      admin },
            new Object[]{ "Dining Out",        FinancialRecord.Type.EXPENSE, new BigDecimal("1600"),   today.withDayOfMonth(11), "Family dinner — MTR & Swiggy",         admin },
            new Object[]{ "Medical",           FinancialRecord.Type.EXPENSE, new BigDecimal("1200"),   today.withDayOfMonth(12), "Apollo pharmacy + doctor visit",       admin },

            // ── March ──────────────────────────────────────────────────────
            new Object[]{ "Salary",           FinancialRecord.Type.INCOME,  new BigDecimal("72000"),  today.minusMonths(1).withDayOfMonth(1),  "Monthly salary — March",               analyst },
            new Object[]{ "Rental Income",    FinancialRecord.Type.INCOME,  new BigDecimal("8500"),   today.minusMonths(1).withDayOfMonth(3),  "Ancestral property rent — Mysuru",     analyst },
            new Object[]{ "Rent",             FinancialRecord.Type.EXPENSE, new BigDecimal("18000"),  today.minusMonths(1).withDayOfMonth(2),  "Flat rent — March",                    analyst },
            new Object[]{ "Groceries",        FinancialRecord.Type.EXPENSE, new BigDecimal("5200"),   today.minusMonths(1).withDayOfMonth(6),  "Reliance Smart + vegetables",          analyst },
            new Object[]{ "Home Loan EMI",    FinancialRecord.Type.EXPENSE, new BigDecimal("14500"),  today.minusMonths(1).withDayOfMonth(5),  "SBI home loan EMI — March",            analyst },
            new Object[]{ "Electricity Bill", FinancialRecord.Type.EXPENSE, new BigDecimal("2100"),   today.minusMonths(1).withDayOfMonth(8),  "BESCOM — March (AC usage high)",       analyst },
            new Object[]{ "Petrol",           FinancialRecord.Type.EXPENSE, new BigDecimal("2800"),   today.minusMonths(1).withDayOfMonth(10), "Fuel — March",                         analyst },
            new Object[]{ "Clothing",         FinancialRecord.Type.EXPENSE, new BigDecimal("3500"),   today.minusMonths(1).withDayOfMonth(14), "Holi shopping — Myntra",               analyst },
            new Object[]{ "Mutual Fund SIP",  FinancialRecord.Type.EXPENSE, new BigDecimal("5000"),   today.minusMonths(1).withDayOfMonth(15), "Axis Bluechip SIP",                    analyst },
            new Object[]{ "OTT & Apps",       FinancialRecord.Type.EXPENSE, new BigDecimal("649"),    today.minusMonths(1).withDayOfMonth(18), "Netflix + Hotstar + Spotify",          analyst },
            new Object[]{ "Medical",          FinancialRecord.Type.EXPENSE, new BigDecimal("2800"),   today.minusMonths(1).withDayOfMonth(22), "Annual health checkup — Manipal",      analyst },
            new Object[]{ "Dining Out",       FinancialRecord.Type.EXPENSE, new BigDecimal("2200"),   today.minusMonths(1).withDayOfMonth(25), "Holi celebration dinner",              analyst },

            // ── February ───────────────────────────────────────────────────
            new Object[]{ "Salary",           FinancialRecord.Type.INCOME,  new BigDecimal("72000"),  today.minusMonths(2).withDayOfMonth(1),  "Monthly salary — February",            admin },
            new Object[]{ "Freelance",        FinancialRecord.Type.INCOME,  new BigDecimal("22000"),  today.minusMonths(2).withDayOfMonth(12), "Mobile app UI project",                admin },
            new Object[]{ "Rent",             FinancialRecord.Type.EXPENSE, new BigDecimal("18000"),  today.minusMonths(2).withDayOfMonth(2),  "Flat rent — February",                 admin },
            new Object[]{ "Groceries",        FinancialRecord.Type.EXPENSE, new BigDecimal("4500"),   today.minusMonths(2).withDayOfMonth(5),  "Weekly groceries",                     admin },
            new Object[]{ "Home Loan EMI",    FinancialRecord.Type.EXPENSE, new BigDecimal("14500"),  today.minusMonths(2).withDayOfMonth(5),  "SBI home loan EMI — February",         admin },
            new Object[]{ "School Fees",      FinancialRecord.Type.EXPENSE, new BigDecimal("6500"),   today.minusMonths(2).withDayOfMonth(7),  "School fees — Q4",                     admin },
            new Object[]{ "Electricity Bill", FinancialRecord.Type.EXPENSE, new BigDecimal("1600"),   today.minusMonths(2).withDayOfMonth(9),  "BESCOM — February",                    admin },
            new Object[]{ "Mutual Fund SIP",  FinancialRecord.Type.EXPENSE, new BigDecimal("5000"),   today.minusMonths(2).withDayOfMonth(15), "Axis Bluechip SIP — February",         admin },
            new Object[]{ "Travel",           FinancialRecord.Type.EXPENSE, new BigDecimal("8500"),   today.minusMonths(2).withDayOfMonth(18), "Goa trip — family weekend",            admin },
            new Object[]{ "Petrol",           FinancialRecord.Type.EXPENSE, new BigDecimal("2200"),   today.minusMonths(2).withDayOfMonth(20), "Fuel — February",                      admin },
            new Object[]{ "Mobile & Internet",FinancialRecord.Type.EXPENSE, new BigDecimal("999"),    today.minusMonths(2).withDayOfMonth(22), "Jio postpaid + broadband",             admin },

            // ── January ────────────────────────────────────────────────────
            new Object[]{ "Salary",           FinancialRecord.Type.INCOME,  new BigDecimal("72000"),  today.minusMonths(3).withDayOfMonth(1),  "Monthly salary — January",             admin },
            new Object[]{ "Bonus",            FinancialRecord.Type.INCOME,  new BigDecimal("30000"),  today.minusMonths(3).withDayOfMonth(10), "Annual performance bonus",             admin },
            new Object[]{ "Rental Income",    FinancialRecord.Type.INCOME,  new BigDecimal("8500"),   today.minusMonths(3).withDayOfMonth(4),  "Property rent — January",              admin },
            new Object[]{ "Rent",             FinancialRecord.Type.EXPENSE, new BigDecimal("18000"),  today.minusMonths(3).withDayOfMonth(2),  "Flat rent — January",                  admin },
            new Object[]{ "Groceries",        FinancialRecord.Type.EXPENSE, new BigDecimal("5100"),   today.minusMonths(3).withDayOfMonth(6),  "Sankranti special groceries",          admin },
            new Object[]{ "Home Loan EMI",    FinancialRecord.Type.EXPENSE, new BigDecimal("14500"),  today.minusMonths(3).withDayOfMonth(5),  "SBI home loan EMI — January",          admin },
            new Object[]{ "LIC Premium",      FinancialRecord.Type.EXPENSE, new BigDecimal("3200"),   today.minusMonths(3).withDayOfMonth(8),  "LIC quarterly premium",                admin },
            new Object[]{ "Electricity Bill", FinancialRecord.Type.EXPENSE, new BigDecimal("1750"),   today.minusMonths(3).withDayOfMonth(9),  "BESCOM — January",                     admin },
            new Object[]{ "Clothing",         FinancialRecord.Type.EXPENSE, new BigDecimal("5500"),   today.minusMonths(3).withDayOfMonth(13), "Sankranti new clothes — family",       admin },
            new Object[]{ "Mutual Fund SIP",  FinancialRecord.Type.EXPENSE, new BigDecimal("5000"),   today.minusMonths(3).withDayOfMonth(15), "Axis Bluechip SIP — January",          admin },
            new Object[]{ "Petrol",           FinancialRecord.Type.EXPENSE, new BigDecimal("2600"),   today.minusMonths(3).withDayOfMonth(20), "Fuel — January",                       admin },
            new Object[]{ "Dining Out",       FinancialRecord.Type.EXPENSE, new BigDecimal("1800"),   today.minusMonths(3).withDayOfMonth(26), "Sankranti family lunch",               admin },

            // ── December ───────────────────────────────────────────────────
            new Object[]{ "Salary",           FinancialRecord.Type.INCOME,  new BigDecimal("72000"),  today.minusMonths(4).withDayOfMonth(1),  "Monthly salary — December",            admin },
            new Object[]{ "Freelance",        FinancialRecord.Type.INCOME,  new BigDecimal("18000"),  today.minusMonths(4).withDayOfMonth(8),  "Year-end freelance project",           admin },
            new Object[]{ "Rent",             FinancialRecord.Type.EXPENSE, new BigDecimal("18000"),  today.minusMonths(4).withDayOfMonth(2),  "Flat rent — December",                 admin },
            new Object[]{ "Groceries",        FinancialRecord.Type.EXPENSE, new BigDecimal("5800"),   today.minusMonths(4).withDayOfMonth(5),  "Christmas + New Year groceries",       admin },
            new Object[]{ "Home Loan EMI",    FinancialRecord.Type.EXPENSE, new BigDecimal("14500"),  today.minusMonths(4).withDayOfMonth(5),  "SBI home loan EMI — December",         admin },
            new Object[]{ "Electricity Bill", FinancialRecord.Type.EXPENSE, new BigDecimal("1900"),   today.minusMonths(4).withDayOfMonth(9),  "BESCOM — December",                    admin },
            new Object[]{ "Travel",           FinancialRecord.Type.EXPENSE, new BigDecimal("12000"),  today.minusMonths(4).withDayOfMonth(22), "Ooty family trip — Christmas",         admin },
            new Object[]{ "Mutual Fund SIP",  FinancialRecord.Type.EXPENSE, new BigDecimal("5000"),   today.minusMonths(4).withDayOfMonth(15), "Axis Bluechip SIP — December",         admin },
            new Object[]{ "Gifts",            FinancialRecord.Type.EXPENSE, new BigDecimal("4200"),   today.minusMonths(4).withDayOfMonth(24), "Christmas + New Year gifts",           admin },
            new Object[]{ "Petrol",           FinancialRecord.Type.EXPENSE, new BigDecimal("2500"),   today.minusMonths(4).withDayOfMonth(18), "Fuel — December",                      admin },

            // ── November ───────────────────────────────────────────────────
            new Object[]{ "Salary",           FinancialRecord.Type.INCOME,  new BigDecimal("72000"),  today.minusMonths(5).withDayOfMonth(1),  "Monthly salary — November",            admin },
            new Object[]{ "Rental Income",    FinancialRecord.Type.INCOME,  new BigDecimal("8500"),   today.minusMonths(5).withDayOfMonth(4),  "Property rent — November",             admin },
            new Object[]{ "Rent",             FinancialRecord.Type.EXPENSE, new BigDecimal("18000"),  today.minusMonths(5).withDayOfMonth(2),  "Flat rent — November",                 admin },
            new Object[]{ "Groceries",        FinancialRecord.Type.EXPENSE, new BigDecimal("6200"),   today.minusMonths(5).withDayOfMonth(5),  "Diwali groceries + sweets",            admin },
            new Object[]{ "Home Loan EMI",    FinancialRecord.Type.EXPENSE, new BigDecimal("14500"),  today.minusMonths(5).withDayOfMonth(5),  "SBI home loan EMI — November",         admin },
            new Object[]{ "Electricity Bill", FinancialRecord.Type.EXPENSE, new BigDecimal("2200"),   today.minusMonths(5).withDayOfMonth(9),  "BESCOM — November (Diwali lights)",    admin },
            new Object[]{ "Clothing",         FinancialRecord.Type.EXPENSE, new BigDecimal("7500"),   today.minusMonths(5).withDayOfMonth(10), "Diwali clothes — family",              admin },
            new Object[]{ "Gifts",            FinancialRecord.Type.EXPENSE, new BigDecimal("5500"),   today.minusMonths(5).withDayOfMonth(12), "Diwali gifts — relatives",             admin },
            new Object[]{ "Mutual Fund SIP",  FinancialRecord.Type.EXPENSE, new BigDecimal("5000"),   today.minusMonths(5).withDayOfMonth(15), "Axis Bluechip SIP — November",         admin },
            new Object[]{ "Petrol",           FinancialRecord.Type.EXPENSE, new BigDecimal("2700"),   today.minusMonths(5).withDayOfMonth(20), "Fuel — November",                      admin },
            new Object[]{ "Dining Out",       FinancialRecord.Type.EXPENSE, new BigDecimal("3200"),   today.minusMonths(5).withDayOfMonth(14), "Diwali family dinner",                 admin }
        );

        for (Object[] r : records) {
            FinancialRecord rec = new FinancialRecord();
            rec.setCategory((String)                    r[0]);
            rec.setType((FinancialRecord.Type)          r[1]);
            rec.setAmount((BigDecimal)                  r[2]);
            rec.setDate((LocalDate)                     r[3]);
            rec.setNotes((String)                       r[4]);
            rec.setCreatedBy((User)                     r[5]);
            recordRepo.save(rec);
        }
    }

    private User createUser(String username, String password, String email, User.Role role) {
        if (userRepo.existsByUsername(username)) return userRepo.findByUsername(username).get();
        User user = new User();
        user.setUsername(username);
        user.setPassword(encoder.encode(password));
        user.setEmail(email);
        user.setRole(role);
        return userRepo.save(user);
    }
}
