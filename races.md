---
layout: default
title: Картинг
---

<div class="contact-title">
    <svg class="icon"><use xlink:href="#results"></use></svg>
    <span>Прокатный картинг</span>
</div>
<p>Мои результаты в прокатном картинге.</p>

<table class="race-table race-desktop">
  <thead>
    <tr>
      <th>Дата</th>
      <th>Трасса</th>
      <th>Заезды</th>
      <th>Лучшее</th>
      <th>Среднее</th>
    </tr>
  </thead>
  <tbody>
    {% assign sorted_races = site.races | sort: "date" | reverse %}
    {% for race in sorted_races %}
    <tr>
      <td>
        <a href="{{ race.url | relative_url }}">
          {{ race.date | date: "%d.%m.%Y" }}
        </a>
      </td>
      <td>{{ race.track }}</td>
      <td>{{ race.races | size }}</td>
      {% assign best_lap = -1 %}
      {% assign total_laps = 0 %}
      {% assign total_time = 0 %}
      {% for race in race.races %}
        {% assign total_laps = total_laps | plus:race.laps.size %}
        {% for lap in race.laps %}
          {% assign total_time = total_time | plus:lap %}
          {% if lap < best_lap or best_lap < 0 %}
            {% assign best_lap = lap %}
          {% endif %}
        {% endfor %}
      {% endfor %}
      {% assign best_parts = best_lap | split: "." %}
      {% assign best_integer = best_parts[0] %}
      {% assign best_decimal = best_parts[1] | append: "000" | slice: 0, 3 %}
      {% assign avg_lap = total_time | divided_by:total_laps %}
      {% assign avg_parts = avg_lap | split: "." %}
      {% assign avg_integer = avg_parts[0] %}
      {% assign avg_decimal = avg_parts[1] | append: "000" | slice: 0, 3 %}
      <td>{{ best_integer }}.{{ best_decimal }}</td>
      <td>{{ avg_integer }}.{{ avg_decimal }}</td>
    </tr>
    {% endfor %}
  </tbody>
</table>

<table class="race-table race-mobile">
  <thead>
    <tr>
      <th>Дата</th>
      <th>Трасса</th>
    </tr>
  </thead>
  <tbody>
    {% assign sorted_races = site.races | sort: "date" | reverse %}
    {% for race in sorted_races %}
    <tr>
      <td>
        <a href="{{ race.url | relative_url }}">
          {{ race.date | date: "%d.%m.%Y" }}
        </a>
      </td>
      <td>{{ race.track }}</td>
    </tr>
    {% endfor %}
  </tbody>
</table>