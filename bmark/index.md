---
title: Battery Mark
metadata: A programm to check overall status of power system in your laptop
keywords:
    - battery
    - benchmark
    - check
    - status
    - laptop
layout: default
---
[По русски](/bmark/ru)  

<center><img src="/images/bmark/screen.png" style="max-width:100%" /></center><br />

<div style="text-align:right">
    <table style="display:inline-block">
        <thead>
            <tr>
                <th style="text-align:center"><a style="transition:none;border:none!important;" target="_blank" href="/files/bmark/bmark-1.1.int.win32.zip"><img src="/images/buttons/windows_en.png" alt="Download for Windows" title="Download for Windows"></a></th>
                <!-- <th></th>
                <th style="text-align:center"><a target="_blank" href="https://itunes.apple.com/us/app/battery-mark/id1022826698"><img src="/images/buttons/appstore_en.png" alt="Download for Mac" title="Download for Mac"></a></th> -->
            </tr>
        </thead>
        <tbody>
            <tr>
                <td style="text-align:center"><sup>Windows XP or later</sup></td>
                <!-- <td>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;</td>
                <td style="text-align:center"><sup>OS X 10.7 or later</sup></td> -->
            </tr>
        </tbody>
    </table>
</div>

_Note_: This application is **currently free**! If you'd like to support me, you can [send a small donation via PayPal](https://www.paypal.me/chermenin). Thanks! :)

## About

**Battery Mark** is a powerful tool designed to evaluate your laptop’s power system and test its performance under extreme conditions.

> **Key features:**
> - **Quick testing** – Assess battery capacity in under 10 minutes.
> - **Full system test** – Analyze the power system with a detailed discharge graph.
> - **CPU stress test** – Fully load all processor cores for accurate performance measurement.
> - **Report generation** – Save test results for future reference or analysis.

## Quick Test

The quick test evaluates your laptop’s battery by measuring the time it takes to lose 3–5% charge.
The results are then extrapolated to estimate maximum battery life.

> **⚠️ Requirements & Notes:**
> - Battery level must be **at least 10%** to start the test.
> - The test ends automatically once sufficient data is collected.
> - Connecting the laptop to AC power during the test will interrupt it.

## Full Test

The full test provides a comprehensive analysis by discharging the battery by at least 50%.
Unlike the quick test, these results are not extrapolated—they reflect real-world performance.

> **✔️ For best results:**
> - Start with a battery level of **90% or higher**.
> - Do not interrupt the test until the laptop shuts down due to low battery.
> - Reconnect to AC power afterward to view the results upon reboot.

> **⚠️ Requirements:**
> - Battery level must be **at least 60%** to begin.
> - The test ends automatically when the battery is fully discharged.

## Results

After completing either test, Battery Mark generates a detailed report containing:
* Laptop specifications
* Discharge graph (for full test, includes a performance score)
* Option to **save the graph as an image**
* Option to **export the report as an HTML file**
