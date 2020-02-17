import java.io.File

fun main(args: Array<String>) {
    // 引数で指定されたrebaseのテキストを読み込む
    val rebaseType = RebaseType.valueOf(args[0])
    val inputFile = args[1]
    val rebaseFile = File(inputFile).absoluteFile
    val rebaseLineList = mutableListOf<RebaseLineData>()
    val regex = Regex("""pick (\w+) (.*)""")
    rebaseFile.readLines().filter(String::isNotBlank).forEach {
        val regResult = regex.matchEntire(it) ?: return@forEach
        val id = regResult.groupValues[1]
        val text = regResult.groupValues[2]
        rebaseLineList.add(RebaseLineData(id, text))
    }

    // 指定されたrebaseの指示を読み込んで、並び替えとコマンドの文字列を生成
    val env: String = System.getenv("REBASE_INFO") ?: "rebase_info.txt"
    val rebaseInfoFile = File(env).absoluteFile
    val builder = when (rebaseType) {
        RebaseType.EXPORT -> getTextForExport(rebaseInfoFile, rebaseLineList)
        RebaseType.DIFF -> getTextForDiff(rebaseInfoFile, rebaseLineList)
    }

    // 引数のファイルに書き込み
    rebaseFile.writeText(builder.toString())
}

private fun getTextForExport(rebaseInfoFile: File, rebaseLineList: MutableList<RebaseLineData>): StringBuilder {
    val builder = StringBuilder()
    rebaseInfoFile.readLines().filter(String::isNotBlank).forEach { line ->
        val input = line.split(" ")
        val id = input[0]
        val command = input[1]
        val matchedLine = rebaseLineList.find { id.startsWith(it.id) } ?: return@forEach
        builder.appendln("$command ${matchedLine.id} ${matchedLine.text}")
    }
    return builder
}

private fun getTextForDiff(rebaseInfoFile: File, rebaseLineList: MutableList<RebaseLineData>): StringBuilder {
    val builder = StringBuilder()
    val pickedIdList = rebaseInfoFile.readLines().filter(String::isNotBlank)
    rebaseLineList.forEach {rebaseLine ->
        val command = if (pickedIdList.any { it.startsWith(rebaseLine.id) }) "pick" else "drop"
        builder.appendln("$command ${rebaseLine.id} ${rebaseLine.text}")
    }
    return builder
}

enum class RebaseType {
    EXPORT, DIFF
}

data class RebaseLineData(val id: String, val text: String)
