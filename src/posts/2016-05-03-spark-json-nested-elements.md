---
layout: post
title: "Spark и JSON: вложенные элементы"
description: Небольшая история об обработке структур данных.
metadata: Обработка вложенных элементов структурированных данных с Apache Spark
keywords:
    - обработка данных
    - apache
    - spark
    - спарк
    - структура данных
    - элемент
    - java
    - scala
    - json
tags:
    - spark
    - json
    - bigdata
    - кодинг
---
Не секрет, что с помощью Spark'а обработать строки в JSON-формате совсем несложно.
Просто читаем источник в _DataFrame_ и выполняем с ними всё, что требуется. Чем-то всё это
напоминает SQL, разве что таблицы обычно плоские, а в структуре JSON'а могут быть
вложенные элементы. Предположим, что у нас есть следующая структура данных:

    root
     |-- profile: struct
          |-- first_name: string
          |-- last_name: string

И из этой структуры нам необходимо извлечь все дочерние элементы от элемента _profile_.
Собственно, для решения этой задачи можно использовать несколько вариантов:

    df.registerTempTable("sample")
    sqlContext.sql("SELECT profile.* FROM sample")
    df.select("profile.*")
    df.select(new Column("profile.*"))
    df.selectExpr("profile.*")

Любой из этих вариантов вернёт нам именно то, что нужно, только... если у вас Spark
версии 1.6.0 или выше. Если же по каким бы то ни было причинам приходится использовать
более ранние версии - в результате выполнения любого такого запроса вернётся просто
пустота.

## Чиним Spark: Scala-mode

Но не стоило бы и начинать сегодняшний пост, если бы нельзя было предложить альтернативное
решение, причем, работающее для всех версий. Воспользуемся возможностью языка Scala
для того, чтобы добавить новый метод уже существующему классу _DataFrame_.

Для этого создадим новый класс _DataFrameEx_ и реализуем его следующим образом:

    import org.apache.spark.sql.types.{StructField, StructType}
    import org.apache.spark.sql.{Column, DataFrame}

    class DataFrameEx(val df: DataFrame) {
      def selectChild(col: String): DataFrame = {
        val fields = df.schema.fields.filter(_.name == col)
        val parent = if (fields.length > 0) fields.head else return df.select()
        val columns = parent.dataType match {
          case x: StructType => x.fields
          case _ => Array.empty[StructField]
        }
        df.select(columns.map(x => s"$col.${x.name}").map(new Column(_)): _*)
      }
    }

    object DataFrameEx {
      implicit def ex(df: DataFrame): DataFrameEx = new DataFrameEx(df)
    }

В методе _selectChild_ мы просто обходим структуру и ищем элементы, которые нужно
будет извлечь. Использовать данное решение можно следующим образом:

    import DataFrameEx._

    val df = sqlContext.read.json("sample.json")
    df.selectChild("profile")

В результате выполнения метода _selectChild_ возвращается новый _DataFrame_, с которым
можно производить любые последующие трансформации.

## Чиним Spark: Java-mode

Если вы пишете на Java, то можно воспользоваться двумя вариантами решения:

1. Использовать класс _DataFrameEx_, написанный на Scala, следующим образом:

        import static DataFrameEx.*;

        DataFrame df = sqlContext.read().json("sample.json");
        ex(df).selectChild("profile")

2. Написать собственный метод непосредственно на Java:

        DataFrame selectChild(DataFrame df, String col) {
            Optional<StructField> parent = Arrays.stream(df.schema().fields())
                    .filter(f -> f.name().equals(col)).findFirst();

            if (parent.isPresent()) {
                DataType type = parent.get().dataType();
                if (type instanceof StructType) {
                    df.select(
                            Arrays.stream(((StructType) type).fields())
                                    .map(f -> String.format("%s.%s", col, f.name()))
                                    .map(Column::new)
                                    .toArray(Column[]::new)
                    );
                }
            }
            return df.select();
        }

Хотя, лучше всего, конечно же, по возможности пользоваться последними версиями всех инструментов.

И удачи в коде... ;)
