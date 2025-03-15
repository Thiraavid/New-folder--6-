const express = require("express");
const router = express.Router();
const pool = require("../db");
const axios = require("axios");
const cheerio = require("cheerio");

// Display all jobs
router.get("/", async (req, res) => {
    try {
        const { search = "" } = req.query;
        const searchQuery = `%${search}%`;

        const jobs = await pool.query(
            "SELECT * FROM jobs WHERE title ILIKE $1 OR company ILIKE $1 ORDER BY id DESC",
            [searchQuery]
        );

        res.render("index", { jobs: jobs.rows, search });
    } catch (err) {
        console.error(err);
        res.status(500).send("Error fetching jobs");
    }
});

// Job Detail Page
router.get("/:id", async (req, res) => {
    try {
        const job = await pool.query("SELECT * FROM jobs WHERE id = $1", [req.params.id]);
        res.render("job-detail", { job: job.rows[0] });
    } catch (err) {
        console.error(err);
        res.status(500).send("Error fetching job details");
    }
});

// Crawl jobs from Naukri
router.get("/crawl", async (req, res) => {
    try {
        const { data } = await axios.get("https://www.naukri.com/software-developer-jobs");
        const $ = cheerio.load(data);
        let jobList = [];

        $(".jobTuple").each((index, element) => {
            const title = $(element).find(".title").text().trim();
            const company = $(element).find(".company").text().trim();
            const location = $(element).find(".location").text().trim();
            const experience = $(element).find(".experience").text().trim();
            const link = $(element).find("a").attr("href");

            if (title && company) {
                jobList.push({ title, company, location, experience, link });
            }
        });

        for (const job of jobList) {
            await pool.query(
                "INSERT INTO jobs (title, company, location, experience, link) VALUES ($1, $2, $3, $4, $5) ON CONFLICT DO NOTHING",
                [job.title, job.company, job.location, job.experience, job.link]
            );
        }

        res.redirect("/jobs");
    } catch (error) {
        console.error(error);
        res.status(500).send("Error fetching jobs");
    }
});

module.exports = router;
